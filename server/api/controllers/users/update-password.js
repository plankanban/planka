/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');

const { isPassword } = require('../../../utils/validators');
const { idInput } = require('../../../utils/inputs');
const { getRemoteAddress } = require('../../../utils/remote-address');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  INVALID_CURRENT_PASSWORD: {
    invalidCurrentPassword: 'Invalid current password',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    password: {
      type: 'string',
      maxLength: 256,
      custom: isPassword,
      required: true,
    },
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    invalidCurrentPassword: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentSession, currentUser } = this.req;

    if (inputs.id === currentUser.id) {
      if (!inputs.currentPassword) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    } else if (currentUser.role !== User.Roles.ADMIN) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await User.qm.getOneById(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (user.email === sails.config.custom.defaultAdminEmail || user.isSsoUser) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (inputs.id === currentUser.id) {
      const isCurrentPasswordValid = await bcrypt.compare(inputs.currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
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
      const { token: accessToken } = sails.helpers.utils.createJwtToken(
        user.id,
        user.passwordChangedAt,
      );

      await Session.qm.createOne({
        accessToken,
        httpOnlyToken: currentSession.httpOnlyToken,
        userId: user.id,
        remoteAddress: getRemoteAddress(this.req),
        userAgent: this.req.headers['user-agent'],
      });

      return {
        item: sails.helpers.users.presentOne(user, currentUser),
        included: {
          accessTokens: [accessToken],
        },
      };
    }

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
