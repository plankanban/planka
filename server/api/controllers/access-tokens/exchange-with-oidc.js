/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /access-tokens/exchange-with-oidc:
 *   post:
 *     summary: Exchange OIDC code for access token
 *     description: Exchanges an OIDC authorization code for an access token. Creates a user if they do not exist.
 *     tags:
 *       - Access Tokens
 *     operationId: exchangeForAccessTokenWithOidc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - nonce
 *             properties:
 *               code:
 *                 type: string
 *                 maxLength: 2048
 *                 description: Authorization code from OIDC provider
 *                 example: abc123def456ghi789
 *               nonce:
 *                 type: string
 *                 maxLength: 1024
 *                 description: Nonce value for OIDC security
 *                 example: random-nonce-123456
 *               withHttpOnlyToken:
 *                 type: boolean
 *                 description: Whether to include HTTP-only authentication cookie
 *                 example: true
 *     responses:
 *       200:
 *         description: OIDC exchange successful
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
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ4...
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only authentication cookie (if `withHttpOnlyToken` is true)
 *             schema:
 *               type: string
 *               example: httpOnlyToken=29aa3e38-8d24-4029-9743-9cbcf0a0dd5c; HttpOnly; Secure; SameSite=Strict
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: OIDC authentication error
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
 *                   enum:
 *                     - Invalid code or nonce
 *                     - Invalid userinfo configuration
 *                   description: Specific error message
 *                   example: Invalid code or nonce
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
 *                     - Terms acceptance required
 *                     - Admin login required to initialize instance
 *                   description: Specific error message
 *                   example: Terms acceptance required
 *       409:
 *         description: Conflict error
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
 *                   example: E_CONFLICT
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Email already in use
 *                     - Username already in use
 *                     - Active users limit reached
 *                   description: Specific error message
 *                   example: Email already in use
 *       422:
 *         description: Missing required values
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
 *                   example: E_UNPROCESSABLE_ENTITY
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Unable to retrieve required values (email, name)
 *       500:
 *         description: OIDC configuration error
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
 *                   example: E_INTERNAL_SERVER_ERROR
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Invalid OIDC configuration
 *     security: []
 */

const { getRemoteAddress } = require('../../../utils/remote-address');

const Errors = {
  INVALID_OIDC_CONFIGURATION: {
    invalidOidcConfiguration: 'Invalid OIDC configuration',
  },
  INVALID_CODE_OR_NONCE: {
    invalidCodeOrNonce: 'Invalid code or nonce',
  },
  INVALID_USERINFO_CONFIGURATION: {
    invalidUserinfoConfiguration: 'Invalid userinfo configuration',
  },
  TERMS_ACCEPTANCE_REQUIRED: {
    termsAcceptanceRequired: 'Terms acceptance required',
  },
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
  },
  ACTIVE_USERS_LIMIT_REACHED: {
    activeUsersLimitReached: 'Active users limit reached',
  },
  MISSING_VALUES: {
    missingValues: 'Unable to retrieve required values (email, name)',
  },
};

module.exports = {
  inputs: {
    code: {
      type: 'string',
      maxLength: 2048,
      required: true,
    },
    nonce: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
    withHttpOnlyToken: {
      type: 'boolean',
    },
  },

  exits: {
    invalidOidcConfiguration: {
      responseType: 'serverError',
    },
    invalidCodeOrNonce: {
      responseType: 'unauthorized',
    },
    invalidUserinfoConfiguration: {
      responseType: 'unauthorized',
    },
    termsAcceptanceRequired: {
      responseType: 'forbidden',
    },
    adminLoginRequiredToInitializeInstance: {
      responseType: 'forbidden',
    },
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
    activeUsersLimitReached: {
      responseType: 'conflict',
    },
    missingValues: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const remoteAddress = getRemoteAddress(this.req);

    const user = await sails.helpers.users
      .getOrCreateOneWithOidc(inputs.code, inputs.nonce)
      .intercept('invalidOidcConfiguration', () => Errors.INVALID_OIDC_CONFIGURATION)
      .intercept('invalidCodeOrNonce', () => {
        sails.log.warn(`Invalid code or nonce! (IP: ${remoteAddress})`);
        return Errors.INVALID_CODE_OR_NONCE;
      })
      .intercept('invalidUserinfoConfiguration', () => Errors.INVALID_USERINFO_CONFIGURATION)
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE)
      .intercept('activeLimitReached', () => Errors.ACTIVE_USERS_LIMIT_REACHED)
      .intercept('missingValues', () => Errors.MISSING_VALUES);

    return sails.helpers.accessTokens.handleSteps
      .with({
        user,
        remoteAddress,
        request: this.req,
        response: this.res,
        withHttpOnlyToken: inputs.withHttpOnlyToken,
      })
      .intercept('adminLoginRequiredToInitializeInstance', (error) => ({
        adminLoginRequiredToInitializeInstance: error.raw,
      }))
      .intercept('termsAcceptanceRequired', (error) => ({
        termsAcceptanceRequired: error.raw,
      }));
  },
};
