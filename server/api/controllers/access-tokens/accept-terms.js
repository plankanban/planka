/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /access-tokens/accept-terms:
 *   post:
 *     summary: Accept terms and conditions
 *     description: Accept terms during the authentication flow. Converts the pending token to an access token.
 *     tags:
 *       - Access Tokens
 *     operationId: acceptTerms
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pendingToken
 *               - signature
 *             properties:
 *               pendingToken:
 *                 type: string
 *                 maxLength: 1024
 *                 description: Pending token received from the authentication flow
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ4...
 *               signature:
 *                 type: string
 *                 minLength: 64
 *                 maxLength: 64
 *                 description: Terms signature hash based on user role
 *                 example: 940226c4c41f51afe3980ceb63704e752636526f4c52a4ea579e85b247493d94
 *               initialLanguage:
 *                 type: string
 *                 enum: [ar-YE, bg-BG, cs-CZ, da-DK, de-DE, el-GR, en-GB, en-US, es-ES, et-EE, fa-IR, fi-FI, fr-FR, hu-HU, id-ID, it-IT, ja-JP, ko-KR, nl-NL, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sk-SK, sr-Cyrl-RS, sr-Latn-RS, sv-SE, tr-TR, uk-UA, uz-UZ, zh-CN, zh-TW]
 *                 nullable: true
 *                 description: Preferred language for user interface and notifications (used only if user language is not set)
 *                 example: en-US
 *     responses:
 *       200:
 *         description: Terms accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   type: string
 *                   description: Access token for API authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ5...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid pending token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   example: E_UNAUTHORIZED
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Invalid pending token
 *       403:
 *         description: Authentication restriction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   example: E_FORBIDDEN
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Invalid signature
 *                     - Admin login required to initialize instance
 *                   description: Specific error message
 *                   example: Invalid signature
 *     security: []
 */

const { getRemoteAddress } = require('../../../utils/remote-address');

const { AccessTokenSteps } = require('../../../constants');

const Errors = {
  INVALID_PENDING_TOKEN: {
    invalidPendingToken: 'Invalid pending token',
  },
  INVALID_SIGNATURE: {
    invalidSignature: 'Invalid signature',
  },
  ADMIN_LOGIN_REQUIRED_TO_INITIALIZE_INSTANCE: {
    adminLoginRequiredToInitializeInstance: 'Admin login required to initialize instance',
  },
};

module.exports = {
  inputs: {
    pendingToken: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
    signature: {
      type: 'string',
      minLength: 64,
      maxLength: 64,
      required: true,
    },
    initialLanguage: {
      type: 'string',
      isIn: User.LANGUAGES,
      allowNull: true,
    },
  },

  exits: {
    invalidPendingToken: {
      responseType: 'unauthorized',
    },
    invalidSignature: {
      responseType: 'forbidden',
    },
    adminLoginRequiredToInitializeInstance: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const remoteAddress = getRemoteAddress(this.req);
    const { httpOnlyToken } = this.req.cookies;

    try {
      payload = sails.helpers.utils.verifyJwtToken(inputs.pendingToken);
    } catch (error) {
      if (error.raw.name === 'TokenExpiredError') {
        throw Errors.INVALID_PENDING_TOKEN;
      }

      sails.log.warn(`Invalid pending token! (IP: ${remoteAddress})`);
      throw Errors.INVALID_PENDING_TOKEN;
    }

    if (payload.subject !== AccessTokenSteps.ACCEPT_TERMS) {
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

    let user = await User.qm.getOneById(session.userId, {
      withDeactivated: false,
    });

    if (!user) {
      throw Errors.INVALID_PENDING_TOKEN; // TODO: introduce separate error?
    }

    if (!user.termsSignature) {
      const termsSignature = sails.hooks.terms.getSignatureByUserRole(user.role);

      if (inputs.signature !== termsSignature) {
        throw Errors.INVALID_SIGNATURE;
      }

      const values = {
        termsSignature,
        termsAcceptedAt: new Date().toISOString(),
      };

      if (!user.language && inputs.initialLanguage) {
        values.language = inputs.initialLanguage;
      }

      ({ user } = await User.qm.updateOne(user.id, values));
    }

    const config = await Config.qm.getOneMain();

    if (!config.isInitialized) {
      if (user.role === User.Roles.ADMIN) {
        await Config.qm.updateOneMain({
          isInitialized: true,
        });
      } else {
        throw Errors.ADMIN_LOGIN_REQUIRED_TO_INITIALIZE_INSTANCE;
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

    return {
      item: accessToken,
    };
  },
};
