/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/totp:
 *   delete:
 *     summary: Disable / reset TOTP
 *     description: Users disable their own TOTP by providing their current password and a valid TOTP or recovery code. Admins resetting another user's TOTP must re-enter their own password (step-up auth); this invalidates all of that user's sessions and trust cookies.
 *     tags:
 *       - Users
 *     operationId: disableUserTotp
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 maxLength: 256
 *               code:
 *                 type: string
 *                 maxLength: 16
 *     responses:
 *       200:
 *         description: TOTP disabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
  INVALID_TOTP_CODE: {
    invalidTotpCode: 'Invalid TOTP code',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

const verifyOwnerCredentials = async (user, inputs) => {
  if (!inputs.currentPassword) {
    throw Errors.INVALID_CURRENT_PASSWORD;
  }

  const isPasswordValid = await bcrypt.compare(inputs.currentPassword, user.password);
  if (!isPasswordValid) {
    throw Errors.INVALID_CURRENT_PASSWORD;
  }

  if (!inputs.code) {
    throw Errors.INVALID_TOTP_CODE;
  }

  if (user.totpSecret) {
    const isCodeValid = sails.helpers.utils.verifyTotpCode.with({
      code: inputs.code,
      secret: user.totpSecret,
    });
    if (isCodeValid) return;
  }

  const recoveryCodes = user.totpRecoveryCodes || [];
  // eslint-disable-next-line no-restricted-syntax
  for (const hashed of recoveryCodes) {
    // eslint-disable-next-line no-await-in-loop
    if (await bcrypt.compare(inputs.code, hashed)) {
      return;
    }
  }

  throw Errors.INVALID_TOTP_CODE;
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
    },
    code: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 16,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    invalidCurrentPassword: {
      responseType: 'forbidden',
    },
    invalidTotpCode: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentSession, currentUser } = this.req;

    const isSelf = inputs.id === currentUser.id;
    const isAdmin = currentUser.role === User.Roles.ADMIN;

    if (!isSelf && !isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    const user = await User.qm.getOneById(inputs.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (sails.config.custom.demoMode) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (isSelf) {
      await verifyOwnerCredentials(user, inputs);
    } else {
      // Admin path: step-up by re-entering the admin's own password.
      // Prevents a hijacked admin session from silently stripping 2FA off other users.
      if (!inputs.currentPassword) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
      if (!currentUser.password) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
      const isAdminPasswordValid = await bcrypt.compare(
        inputs.currentPassword,
        currentUser.password,
      );
      if (!isAdminPasswordValid) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    }

    const { user: updatedUser } = await User.qm.updateOne(user.id, {
      totpSecret: null,
      isTotpEnabled: false,
      totpEnabledAt: null,
      totpRecoveryCodes: null,
    });

    await sails.helpers.trustedDevices.deleteAllForUser.with({ userId: user.id });

    if (!isSelf) {
      await sails.helpers.sessions.invalidateAllForUser.with({ userId: user.id });
    } else if (currentSession) {
      await sails.helpers.sessions.invalidateAllForUser.with({
        userId: user.id,
        exceptSessionId: currentSession.id,
      });
    }

    return {
      item: sails.helpers.users.presentOne(updatedUser, currentUser),
    };
  },
};
