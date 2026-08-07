/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/totp/enable:
 *   post:
 *     summary: Finalize TOTP enrollment
 *     description: Verifies the first TOTP code against the pending secret created via /totp/setup, persists the enabled flag, and returns one-time recovery codes.
 *     tags:
 *       - Users
 *     operationId: enableUserTotp
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - code
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 maxLength: 256
 *               code:
 *                 type: string
 *                 maxLength: 16
 *     responses:
 *       200:
 *         description: TOTP enabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/User'
 *                 included:
 *                   type: object
 *                   properties:
 *                     recoveryCodes:
 *                       type: array
 *                       items:
 *                         type: string
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
  TOTP_SETUP_NOT_INITIATED: {
    totpSetupNotInitiated: 'TOTP setup has not been initiated',
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
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      required: true,
    },
    code: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 16,
      required: true,
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
    totpSetupNotInitiated: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id !== currentUser.id) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const user = await User.qm.getOneById(inputs.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (sails.config.custom.demoMode) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (!user.password) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const isPasswordValid = await bcrypt.compare(inputs.currentPassword, user.password);
    if (!isPasswordValid) {
      throw Errors.INVALID_CURRENT_PASSWORD;
    }

    if (!user.totpSecret) {
      throw Errors.TOTP_SETUP_NOT_INITIATED;
    }

    const isCodeValid = sails.helpers.utils.verifyTotpCode.with({
      code: inputs.code,
      secret: user.totpSecret,
    });

    if (!isCodeValid) {
      throw Errors.INVALID_TOTP_CODE;
    }

    const { plain: recoveryCodes, hashed: hashedRecoveryCodes } =
      await sails.helpers.utils.generateRecoveryCodes();

    const { user: updatedUser } = await User.qm.updateOne(user.id, {
      isTotpEnabled: true,
      totpEnabledAt: new Date().toISOString(),
      totpRecoveryCodes: hashedRecoveryCodes,
    });

    return {
      item: sails.helpers.users.presentOne(updatedUser, currentUser),
      included: {
        recoveryCodes,
      },
    };
  },
};
