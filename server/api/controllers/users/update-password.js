/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/password:
 *   patch:
 *     summary: Update user password
 *     description: Updates a user's password. Users must provide a current password when updating their own password. Admins can update any user's password without the current password. Returns a new access token when updating own password.
 *     tags:
 *       - Users
 *     operationId: updateUserPassword
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user whose password to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 maxLength: 256
 *                 description: Password (must meet password requirements)
 *                 example: SecurePassword123!
 *               currentPassword:
 *                 type: string
 *                 maxLength: 256
 *                 description: Current password (required when updating own password)
 *                 example: SecurePassword456!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/User'
 *                 included:
 *                   type: object
 *                   required:
 *                     - accessToken
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New acces tokens (when updating own password)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ4...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
          accessToken,
        },
      };
    }

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
