/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/totp/recovery-codes:
 *   post:
 *     summary: Regenerate TOTP recovery codes
 *     description: Replaces the user's recovery code set with 10 freshly-generated codes. Requires the current password and a valid TOTP code.
 *     tags:
 *       - Users
 *     operationId: regenerateUserTotpRecoveryCodes
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
 *         description: Recovery codes regenerated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 included:
 *                   type: object
 *                   properties:
 *                     recoveryCodes:
 *                       type: array
 *                       items:
 *                         type: string
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
  TOTP_NOT_ENABLED: {
    totpNotEnabled: 'TOTP is not enabled',
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
    totpNotEnabled: {
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

    if (!user.isTotpEnabled || !user.totpSecret) {
      throw Errors.TOTP_NOT_ENABLED;
    }

    if (sails.config.custom.demoMode) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const isPasswordValid = await bcrypt.compare(inputs.currentPassword, user.password);
    if (!isPasswordValid) {
      throw Errors.INVALID_CURRENT_PASSWORD;
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

    await User.qm.updateOne(user.id, {
      totpRecoveryCodes: hashedRecoveryCodes,
    });

    return {
      included: {
        recoveryCodes,
      },
    };
  },
};
