/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /access-tokens/accept-terms:
 *   post:
 *     summary: Accept terms and conditions
 *     description: Accept terms during the authentication flow. Continues the remaining login steps - an access token is returned directly, or, if the user has TOTP enabled and the device is not trusted, a new pending token for the TOTP step is returned instead. The pending token that was submitted can no longer be used afterwards.
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
 *                 description: Terms signature hash
 *                 example: 940226c4c41f51afe3980ceb63704e752636526f4c52a4ea579e85b247493d94
 *               initialLanguage:
 *                 type: string
 *                 enum: [ar-YE, bg-BG, ca-ES, cs-CZ, da-DK, de-DE, el-GR, en-GB, en-US, es-ES, et-EE, fa-IR, fi-FI, fr-FR, hu-HU, id-ID, it-IT, ja-JP, ko-KR, nl-NL, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sk-SK, sr-Cyrl-RS, sr-Latn-RS, sv-SE, tr-TR, uk-UA, uz-UZ, vi-VN, zh-CN, zh-TW]
 *                 nullable: true
 *                 description: Preferred language for user interface and notifications (used only if user language is not set)
 *                 example: en-US
 *     responses:
 *       200:
 *         description: Terms accepted and login completed
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
 *         description: Invalid, expired or already used pending token
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
 *                     - TOTP verification required
 *                     - Admin login required to initialize instance
 *                   description: Specific error message
 *                   example: TOTP verification required
 *                 pendingToken:
 *                   type: string
 *                   description: Pending token for the next step (present when TOTP verification is required)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ4...
 *                 step:
 *                   type: string
 *                   enum:
 *                     - verify-totp
 *                   description: Next step of the authentication flow (present when TOTP verification is required)
 *                   example: verify-totp
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
    totpVerificationRequired: {
      responseType: 'forbidden',
    },
    termsAcceptanceRequired: {
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

    if (payload.subject !== AccessTokenSteps.ACCEPT_TERMS) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    const session = await Session.qm.getOneUndeletedByPendingToken(inputs.pendingToken);

    if (!session) {
      sails.log.warn(`Invalid pending token! (IP: ${remoteAddress})`);
      throw Errors.INVALID_PENDING_TOKEN;
    }

    if (session.httpOnlyToken && httpOnlyToken !== session.httpOnlyToken) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    if (!sails.hooks.terms.isSignatureValid(inputs.signature)) {
      throw Errors.INVALID_SIGNATURE;
    }

    let user = await User.qm.getOneById(session.userId, {
      withDeactivated: false,
    });

    if (!user) {
      throw Errors.INVALID_PENDING_TOKEN; // TODO: introduce separate error?
    }

    if (user.passwordChangedAt > payload.issuedAt) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    // Checked before anything is stored, so that a refused login leaves the
    // account as it was.
    const internalConfig = await InternalConfig.qm.getOneMain();

    if (!internalConfig.isInitialized && user.role !== User.Roles.ADMIN) {
      throw Errors.ADMIN_LOGIN_REQUIRED_TO_INITIALIZE_INSTANCE;
    }

    const values = {
      termsSignature: inputs.signature,
      termsAcceptedAt: new Date().toISOString(),
    };

    if (!user.language && inputs.initialLanguage) {
      values.language = inputs.initialLanguage;
    }

    ({ user } = await User.qm.updateOne(user.id, values));

    // The rest of the login runs through the same steps as a password login,
    // on the session that holds this pending token.
    return sails.helpers.accessTokens.handleSteps
      .with({
        user,
        remoteAddress,
        request: this.req,
        response: this.res,
        pendingSession: session,
      })
      .intercept('invalidPendingToken', () => Errors.INVALID_PENDING_TOKEN)
      .intercept('adminLoginRequiredToInitializeInstance', (error) => ({
        adminLoginRequiredToInitializeInstance: error.raw,
      }))
      .intercept('termsAcceptanceRequired', (error) => ({
        termsAcceptanceRequired: error.raw,
      }))
      .intercept('totpVerificationRequired', (error) => ({
        totpVerificationRequired: error.raw,
      }));
  },
};
