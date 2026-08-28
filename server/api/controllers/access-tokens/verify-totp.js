/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /access-tokens/verify-totp:
 *   post:
 *     summary: Complete TOTP step of the login flow
 *     description: Exchanges a pending token plus a valid TOTP or recovery code for a full access token. Optionally remembers the browser for 30 days via a trust cookie.
 *     tags:
 *       - Access Tokens
 *     operationId: verifyTotp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pendingToken
 *               - code
 *             properties:
 *               pendingToken:
 *                 type: string
 *                 maxLength: 1024
 *               code:
 *                 type: string
 *                 maxLength: 16
 *               trustDevice:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: TOTP verified, access token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   type: string
 *     security: []
 */

const bcrypt = require('bcrypt');

const { getRemoteAddress } = require('../../../utils/remote-address');

const {
  AccessTokenSteps,
  TRUST_DEVICE_COOKIE_NAME,
  TRUST_DEVICE_EXPIRES_IN_DAYS,
} = require('../../../constants');

const Errors = {
  INVALID_PENDING_TOKEN: {
    invalidPendingToken: 'Invalid pending token',
  },
  INVALID_TOTP_CODE: {
    invalidTotpCode: 'Invalid TOTP code',
  },
};

const setTrustDeviceCookie = (response, plainToken) => {
  response.cookie(TRUST_DEVICE_COOKIE_NAME, plainToken, {
    maxAge: TRUST_DEVICE_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    path: sails.config.custom.baseUrlPath || '/',
    secure: sails.config.custom.baseUrlSecure,
    httpOnly: true,
    sameSite: 'strict',
  });
};

module.exports = {
  inputs: {
    pendingToken: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
    code: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 16,
      required: true,
    },
    trustDevice: {
      type: 'boolean',
    },
  },

  exits: {
    invalidPendingToken: {
      responseType: 'unauthorized',
    },
    invalidTotpCode: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const remoteAddress = getRemoteAddress(this.req);
    const { httpOnlyToken } = this.req.cookies;

    let payload;
    try {
      payload = sails.helpers.utils.verifyJwtToken(inputs.pendingToken);
    } catch (error) {
      if (error.raw && error.raw.name === 'TokenExpiredError') {
        throw Errors.INVALID_PENDING_TOKEN;
      }
      sails.log.warn(`Invalid pending token! (IP: ${remoteAddress})`);
      throw Errors.INVALID_PENDING_TOKEN;
    }

    if (payload.subject !== AccessTokenSteps.VERIFY_TOTP) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    let session = await Session.qm.getOneUndeletedByPendingToken(inputs.pendingToken);
    if (!session) {
      sails.log.warn(`Invalid pending token! (IP: ${remoteAddress})`);
      throw Errors.INVALID_PENDING_TOKEN;
    }

    if (session.httpOnlyToken && httpOnlyToken !== session.httpOnlyToken) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    const user = await User.qm.getOneById(session.userId, {
      withDeactivated: false,
    });
    if (!user || !user.isTotpEnabled || !user.totpSecret) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    let codeAccepted = sails.helpers.utils.verifyTotpCode.with({
      code: inputs.code,
      secret: user.totpSecret,
    });

    let consumedRecoveryIndex = -1;
    if (!codeAccepted) {
      const recoveryCodes = user.totpRecoveryCodes || [];
      for (let i = 0; i < recoveryCodes.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        if (await bcrypt.compare(inputs.code, recoveryCodes[i])) {
          codeAccepted = true;
          consumedRecoveryIndex = i;
          break;
        }
      }
    }

    if (!codeAccepted) {
      sails.log.warn(`Invalid TOTP code! (IP: ${remoteAddress})`);

      // Incremented in the database rather than read-then-written, so two
      // requests racing on the same pending token cannot each see the old
      // count and spend the budget twice.
      const queryResult = await sails.sendNativeQuery(
        'UPDATE session SET pending_token_attempts = pending_token_attempts + 1, updated_at = $1 WHERE id = $2 RETURNING pending_token_attempts',
        [new Date().toISOString(), session.id],
      );

      const [row] = queryResult.rows;

      if (row && row.pending_token_attempts > sails.config.custom.totpMaxAttempts) {
        sails.log.warn(`TOTP attempts exhausted, dropping session (IP: ${remoteAddress})`);
        await Session.qm.deleteOneById(session.id);

        throw Errors.INVALID_PENDING_TOKEN;
      }

      throw Errors.INVALID_TOTP_CODE;
    }

    if (consumedRecoveryIndex >= 0) {
      const previousRecoveryCodes = user.totpRecoveryCodes || [];
      const remaining = previousRecoveryCodes.filter(
        (_value, idx) => idx !== consumedRecoveryIndex,
      );

      // Compare-and-set: only swap the array if it still matches the state we read.
      // A second concurrent verify-totp using the same recovery code will see
      // rowCount = 0 here and be rejected as INVALID_TOTP_CODE — preventing replay.
      const queryResult = await sails.sendNativeQuery(
        'UPDATE user_account SET totp_recovery_codes = $1::jsonb, updated_at = $2 WHERE id = $3 AND totp_recovery_codes = $4::jsonb',
        [
          JSON.stringify(remaining),
          new Date().toISOString(),
          user.id,
          JSON.stringify(previousRecoveryCodes),
        ],
      );

      if (queryResult.rowCount === 0) {
        sails.log.warn(`Recovery code race detected, rejecting (IP: ${remoteAddress})`);
        throw Errors.INVALID_TOTP_CODE;
      }
    }

    const { token: accessToken, payload: accessTokenPayload } = sails.helpers.utils.createJwtToken(
      user.id,
    );

    session = await Session.qm.updateOne(session.id, {
      accessToken,
      pendingToken: null,
    });

    if (session.httpOnlyToken && !this.req.isSocket) {
      sails.helpers.utils.setHttpOnlyTokenCookie(
        session.httpOnlyToken,
        accessTokenPayload,
        this.res,
      );
    }

    if (inputs.trustDevice && !this.req.isSocket) {
      const { plainToken } = await sails.helpers.trustedDevices.createOne.with({
        userId: user.id,
        userAgent: this.req.headers['user-agent'] || null,
      });
      setTrustDeviceCookie(this.res, plainToken);
    }

    return {
      item: accessToken,
    };
  },
};
