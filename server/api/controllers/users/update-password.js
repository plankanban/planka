const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');

const { getRemoteAddress } = require('../../../utils/remoteAddress');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INVALID_CURRENT_PASSWORD: {
    invalidCurrentPassword: 'Invalid current password',
  },
};

const passwordValidator = (value) => zxcvbn(value).score >= 2; // TODO: move to config

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    password: {
      type: 'string',
      custom: passwordValidator,
      required: true,
    },
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    invalidCurrentPassword: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id === currentUser.id) {
      if (!inputs.currentPassword) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    } else if (!currentUser.isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await sails.helpers.users.getOne(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (user.email === sails.config.custom.defaultAdminEmail || user.isSso) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (
      inputs.id === currentUser.id &&
      !bcrypt.compareSync(inputs.currentPassword, user.password)
    ) {
      throw Errors.INVALID_CURRENT_PASSWORD;
    }

    const values = _.pick(inputs, ['password']);

    user = await sails.helpers.users.updateOne.with({
      values,
      record: user,
      actorUser: currentUser,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (user.id === currentUser.id) {
      const accessToken = sails.helpers.utils.createToken(user.id, user.passwordUpdatedAt);

      await Session.create({
        accessToken,
        userId: user.id,
        remoteAddress: getRemoteAddress(this.req),
        userAgent: this.req.headers['user-agent'],
      });

      return {
        item: user,
        included: {
          accessTokens: [accessToken],
        },
      };
    }

    return {
      item: user,
    };
  },
};
