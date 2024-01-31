const bcrypt = require('bcrypt');
const validator = require('validator');

const { getRemoteAddress } = require('../../../utils/remoteAddress');

const Errors = {
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
  },

  exits: {
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
      throw Errors.INVALID_EMAIL_OR_USERNAME;
    }

    if (user.isSso) {
      throw Errors.USE_SINGLE_SIGN_ON;
    }

    if (!bcrypt.compareSync(inputs.password, user.password)) {
      sails.log.warn(`Invalid password! (IP: ${remoteAddress})`);
      throw Errors.INVALID_PASSWORD;
    }

    const accessToken = sails.helpers.utils.createToken(user.id);

    await Session.create({
      accessToken,
      remoteAddress,
      userId: user.id,
      userAgent: this.req.headers['user-agent'],
    });

    return {
      item: accessToken,
    };
  },
};
