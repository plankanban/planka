const { getRemoteAddress } = require('../../../utils/remoteAddress');

const Errors = {
  INVALID_CODE_OR_NONCE: {
    invalidCodeOrNonce: 'Invalid code or nonce',
  },
  INVALID_USERINFO_SIGNATURE: {
    invalidUserinfoSignature: 'Invalid signature on userinfo due to client misconfiguration',
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
  },

  exits: {
    invalidCodeOrNonce: {
      responseType: 'unauthorized',
    },
    invalidUserinfoSignature: {
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
      .intercept('invalidUserinfoSignature', () => Errors.INVALID_USERINFO_SIGNATURE)
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
