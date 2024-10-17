const bcrypt = require('bcrypt');
const validator = require('validator');
const { v4: uuid } = require('uuid');

const { getRemoteAddress } = require('../../../utils/remoteAddress');

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
};

const emailOrUsernameValidator = (value) =>
  value.includes('@')
    ? validator.isEmail(value)
    : value.length >= 3 && value.length <= 16 && /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/.test(value);

module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      custom: emailOrUsernameValidator,
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    withHttpOnlyToken: {
      type: 'boolean',
      defaultsTo: false,
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
  },

  async fn(inputs) {
    if (sails.config.custom.oidcEnforced) {
      throw Errors.USE_SINGLE_SIGN_ON;
    }

    const remoteAddress = getRemoteAddress(this.req);
    const user = await sails.helpers.users.getOneByEmailOrUsername(inputs.emailOrUsername);

    if (!user) {
      sails.log.warn(
        `Invalid email or username: "${inputs.emailOrUsername}"! (IP: ${remoteAddress})`,
      );

      throw sails.config.custom.showDetailedAuthErrors
        ? Errors.INVALID_EMAIL_OR_USERNAME
        : Errors.INVALID_CREDENTIALS;
    }

    if (user.isSso) {
      throw Errors.USE_SINGLE_SIGN_ON;
    }

    if (!bcrypt.compareSync(inputs.password, user.password)) {
      sails.log.warn(`Invalid password! (IP: ${remoteAddress})`);

      throw sails.config.custom.showDetailedAuthErrors
        ? Errors.INVALID_PASSWORD
        : Errors.INVALID_CREDENTIALS;
    }

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
