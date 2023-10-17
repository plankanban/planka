const { getRemoteAddress } = require('../../../utils/remoteAddress');

const Errors = {
  INVALID_TOKEN: {
    invalidToken: 'Invalid token',
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
    token: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidToken: {
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
      .getOrCreateOneByOidcToken(inputs.token)
      .intercept('invalidToken', () => {
        sails.log.warn(`Invalid token! (IP: ${remoteAddress})`);
        return Errors.INVALID_TOKEN;
      })
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE)
      .intercept('missingValues', () => Errors.MISSING_VALUES);

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
