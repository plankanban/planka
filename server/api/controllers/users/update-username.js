/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/username:
 *   patch:
 *     summary: Update user username
 *     description: Updates a user's username. Users must provide a current password when updating their own username (unless they are SSO users with `oidcIgnoreUsername` enabled). Admins can update any user's username without the current password.
 *     tags:
 *       - Users
 *     operationId: updateUserUsername
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user whose username to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 16
 *                 pattern: '^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$'
 *                 nullable: true
 *                 description: Unique username for user identification
 *                 example: john_doe
 *               currentPassword:
 *                 type: string
 *                 maxLength: 256
 *                 description: Current password (required when updating own username)
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Username updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const bcrypt = require('bcrypt');

const { idInput } = require('../../../utils/inputs');

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
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
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
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id !== currentUser.id && currentUser.role !== User.Roles.ADMIN) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await User.qm.getOneById(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (user.email === sails.config.custom.defaultAdminEmail) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (user.isSsoUser) {
      if (!sails.config.custom.oidcIgnoreUsername) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    } else if (inputs.id === currentUser.id) {
      if (!inputs.currentPassword) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }

      const isCurrentPasswordValid = await bcrypt.compare(inputs.currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    }

    const values = _.pick(inputs, ['username']);

    user = await sails.helpers.users.updateOne
      .with({
        values,
        record: user,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
