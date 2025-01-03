const { v4: uuid } = require('uuid');

const { getRemoteAddress } = require('../../../utils/remoteAddress');

const Errors = {
  INVALID_OIDC_CONFIGURATION: {
    invalidOIDCConfiguration: 'Invalid OIDC configuration',
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
  MISSING_VALUES: {
    missingValues: 'Unable to retrieve required values (email, name)',
  },
};

module.exports = {
  inputs: {
    code: {
      type: 'string',
      required: true,
    },
    nonce: {
      type: 'string',
      required: true,
    },
    withHttpOnlyToken: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    invalidOIDCConfiguration: {
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
    missingValues: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const remoteAddress = getRemoteAddress(this.req);

    const user = await sails.helpers.users
      .getOrCreateOneUsingOidc(inputs.code, inputs.nonce)
      .intercept('invalidCodeOrNonce', () => {
        sails.log.warn(`Invalid code or nonce! (IP: ${remoteAddress})`);
        return Errors.INVALID_CODE_OR_NONCE;
      })
      .intercept('invalidOIDCConfiguration', () => Errors.INVALID_OIDC_CONFIGURATION)
      .intercept('invalidUserinfoConfiguration', () => Errors.INVALID_USERINFO_CONFIGURATION)
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE)
      .intercept('missingValues', () => Errors.MISSING_VALUES);

    const { token: accessToken, payload: accessTokenPayload } = sails.helpers.utils.createJwtToken(
      user.id,
    );

    const httpOnlyToken = inputs.withHttpOnlyToken ? uuid() : null;

    await Session.create({
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
