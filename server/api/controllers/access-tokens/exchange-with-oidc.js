/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
