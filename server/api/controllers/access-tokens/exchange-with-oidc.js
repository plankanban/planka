/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');

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
      defaultsTo: false,
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

    const { token: accessToken, payload: accessTokenPayload } = sails.helpers.utils.createJwtToken(
      user.id,
    );

    const httpOnlyToken = inputs.withHttpOnlyToken ? uuid() : null;

    await Session.qm.createOne({
      accessToken,
      httpOnlyToken,
      remoteAddress,
      userId: user.id,
      userAgent: this.req.headers['user-agent'],
    });

    if (httpOnlyToken && !this.req.isSocket) {
      sails.helpers.utils.setHttpOnlyTokenCookie(httpOnlyToken, accessTokenPayload, this.res);
    }

    return {
      item: accessToken,
    };
  },
};
