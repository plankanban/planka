/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { AccessTokenSteps, TRUST_DEVICE_COOKIE_NAME } = require('../../../constants');

const Errors = {
  ADMIN_LOGIN_REQUIRED_TO_INITIALIZE_INSTANCE: {
    adminLoginRequiredToInitializeInstance: 'Admin login required to initialize instance',
  },
  INVALID_PENDING_TOKEN: {
    invalidPendingToken: 'Invalid pending token',
  },
};

const PENDING_TOKEN_EXPIRES_IN = 10 * 60;

module.exports = {
  inputs: {
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
      required: true,
    },
    response: {
      type: 'ref',
      required: true,
    },
    remoteAddress: {
      type: 'string',
      required: true,
    },
    withHttpOnlyToken: {
      type: 'boolean',
    },
    // Session holding the pending token the caller has just redeemed. When
    // given, the flow continues on that session instead of starting a new one.
    pendingSession: {
      type: 'ref',
    },
  },

  exits: {
    adminLoginRequiredToInitializeInstance: {},
    invalidPendingToken: {},
    termsAcceptanceRequired: {},
    totpVerificationRequired: {},
  },

  async fn(inputs) {
    const internalConfig = await InternalConfig.qm.getOneMain();

    if (!internalConfig.isInitialized) {
      if (inputs.user.role === User.Roles.ADMIN) {
        if (inputs.user.termsSignature) {
          await InternalConfig.qm.updateOneMain({
            isInitialized: true,
          });
        }
      } else {
        throw Errors.ADMIN_LOGIN_REQUIRED_TO_INITIALIZE_INSTANCE;
      }
    }

    // Issues the pending token for a step: a new session normally, or, when
    // the caller is continuing a flow that already has one, the same session
    // row (id and cookie value kept) with its pending token replaced. The
    // replacement only applies while the token that was presented is still the
    // one stored, so a pending token can be redeemed exactly once.
    const issuePendingToken = async (step) => {
      const { token: pendingToken, payload: pendingTokenPayload } =
        sails.helpers.utils.createJwtToken(step, undefined, PENDING_TOKEN_EXPIRES_IN);

      let session;
      if (inputs.pendingSession) {
        session = await Session.qm.updateOne(
          {
            id: inputs.pendingSession.id,
            pendingToken: inputs.pendingSession.pendingToken,
            deletedAt: null,
          },
          {
            pendingToken,
            pendingTokenAttempts: 0,
          },
        );

        if (!session) {
          throw Errors.INVALID_PENDING_TOKEN;
        }
      } else {
        session = await sails.helpers.sessions.createOne.with({
          values: {
            pendingToken,
            userId: inputs.user.id,
            remoteAddress: inputs.remoteAddress,
            userAgent: inputs.request.headers['user-agent'],
          },
          withHttpOnlyToken: inputs.withHttpOnlyToken,
        });
      }

      if (session.httpOnlyToken && !inputs.request.isSocket) {
        sails.helpers.utils.setHttpOnlyTokenCookie(
          session.httpOnlyToken,
          pendingTokenPayload,
          inputs.response,
        );
      }

      return pendingToken;
    };

    if (!sails.hooks.terms.isSignatureValid(inputs.user.termsSignature)) {
      const pendingToken = await issuePendingToken(AccessTokenSteps.ACCEPT_TERMS);

      throw {
        termsAcceptanceRequired: {
          pendingToken,
          message: 'Terms acceptance required',
          step: AccessTokenSteps.ACCEPT_TERMS,
        },
      };
    }

    if (inputs.user.isTotpEnabled) {
      const trustCookie =
        inputs.request.cookies && inputs.request.cookies[TRUST_DEVICE_COOKIE_NAME];

      const isDeviceTrusted = trustCookie
        ? await sails.helpers.trustedDevices.checkToken.with({
            userId: inputs.user.id,
            plainToken: trustCookie,
          })
        : false;

      if (!isDeviceTrusted) {
        const pendingToken = await issuePendingToken(AccessTokenSteps.VERIFY_TOTP);

        throw {
          totpVerificationRequired: {
            pendingToken,
            message: 'TOTP verification required',
            step: AccessTokenSteps.VERIFY_TOTP,
          },
        };
      }
    }

    const { token: accessToken, payload: accessTokenPayload } = sails.helpers.utils.createJwtToken(
      inputs.user.id,
    );

    let session;
    if (inputs.pendingSession) {
      session = await Session.qm.updateOne(
        {
          id: inputs.pendingSession.id,
          pendingToken: inputs.pendingSession.pendingToken,
          deletedAt: null,
        },
        {
          accessToken,
          pendingToken: null,
        },
      );

      if (!session) {
        throw Errors.INVALID_PENDING_TOKEN;
      }
    } else {
      session = await sails.helpers.sessions.createOne.with({
        values: {
          accessToken,
          userId: inputs.user.id,
          remoteAddress: inputs.remoteAddress,
          userAgent: inputs.request.headers['user-agent'],
        },
        withHttpOnlyToken: inputs.withHttpOnlyToken,
      });
    }

    if (session.httpOnlyToken && !inputs.request.isSocket) {
      sails.helpers.utils.setHttpOnlyTokenCookie(
        session.httpOnlyToken,
        accessTokenPayload,
        inputs.response,
      );
    }

    return {
      item: accessToken,
    };
  },
};
