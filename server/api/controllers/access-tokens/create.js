/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /access-tokens:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using email/username and password. Returns an access token for API authentication.
 *     tags:
 *       - Access Tokens
 *     operationId: createAccessToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrUsername
 *               - password
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 maxLength: 256
 *                 description: Email address or username of the user
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 maxLength: 256
 *                 description: Password of the user
 *                 example: SecurePassword123!
 *               withHttpOnlyToken:
 *                 type: boolean
 *                 description: Whether to include an HTTP-only authentication cookie
 *                 example: true
 *     responses:
 *       200:
 *         description: Login successful
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
 *         description: Invalid credentials
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
 *                     - Invalid credentials
 *                     - Invalid email or username
 *                     - Invalid password
 *                   description: Specific error message
 *                   example: Invalid credentials
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
 *                     - Use single sign-on
 *                     - Terms acceptance required
 *                     - Admin login required to initialize instance
 *                   description: Specific error message
 *                   example: Use single sign-on
 *     security: []
 */

const bcrypt = require('bcrypt');

const { isEmailOrUsername } = require('../../../utils/validators');
const { getRemoteAddress } = require('../../../utils/remote-address');

const Errors = {
  INVALID_CREDENTIALS: {
    invalidCredentials: 'Invalid credentials',
  },
  INVALID_EMAIL_OR_USERNAME: {
    invalidEmailOrUsername: 'Invalid email or username',
  },
  INVALID_PASSWORD: {
    invalidPassword: 'Invalid password',
  },
  USE_SINGLE_SIGN_ON: {
    useSingleSignOn: 'Use single sign-on',
  },
  TERMS_ACCEPTANCE_REQUIRED: {
    termsAcceptanceRequired: 'Terms acceptance required',
  },
};

module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      maxLength: 256,
      custom: isEmailOrUsername,
      required: true,
    },
    password: {
      type: 'string',
      maxLength: 256,
      required: true,
    },
    withHttpOnlyToken: {
      type: 'boolean',
    },
  },

  exits: {
    invalidCredentials: {
      responseType: 'unauthorized',
    },
    invalidEmailOrUsername: {
      responseType: 'unauthorized',
    },
    invalidPassword: {
      responseType: 'unauthorized',
    },
    useSingleSignOn: {
      responseType: 'forbidden',
    },
    termsAcceptanceRequired: {
      responseType: 'forbidden',
    },
    adminLoginRequiredToInitializeInstance: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    if (sails.config.custom.oidcEnforced) {
      throw Errors.USE_SINGLE_SIGN_ON;
    }

    const remoteAddress = getRemoteAddress(this.req);
    const user = await User.qm.getOneActiveByEmailOrUsername(inputs.emailOrUsername);

    if (!user) {
      sails.log.warn(
        `Invalid email or username: "${inputs.emailOrUsername}"! (IP: ${remoteAddress})`,
      );

      throw sails.config.custom.showDetailedAuthErrors
        ? Errors.INVALID_EMAIL_OR_USERNAME
        : Errors.INVALID_CREDENTIALS;
    }

    if (user.isSsoUser) {
      throw Errors.USE_SINGLE_SIGN_ON;
    }

    const isPasswordValid = await bcrypt.compare(inputs.password, user.password);

    if (!isPasswordValid) {
      sails.log.warn(`Invalid password! (IP: ${remoteAddress})`);

      throw sails.config.custom.showDetailedAuthErrors
        ? Errors.INVALID_PASSWORD
        : Errors.INVALID_CREDENTIALS;
    }

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
