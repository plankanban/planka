/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
