/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/email:
 *   patch:
 *     summary: Update user email
 *     description: Updates a user's email address. Users must provide current password when updating their own email. Admins can update any user's email without a password.
 *     tags:
 *       - Users
 *     operationId: updateUserEmail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user whose email to update
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 256
 *                 description: Email address for login and notifications
 *                 example: john.doe@example.com
 *               currentPassword:
 *                 type: string
 *                 maxLength: 256
 *                 description: Current password (required when updating own email)
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Email updated successfully
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
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    email: {
      type: 'string',
      maxLength: 256,
      isEmail: true,
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
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

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

    const values = _.pick(inputs, ['email']);

    user = await sails.helpers.users.updateOne
      .with({
        values,
        record: user,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
