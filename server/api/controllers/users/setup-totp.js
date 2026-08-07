/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/totp/setup:
 *   post:
 *     summary: Begin TOTP enrollment
 *     description: Generates a TOTP secret and provisioning URI for the authenticated user. The user is only fully enrolled after a successful call to /totp/enable.
 *     tags:
 *       - Users
 *     operationId: setupUserTotp
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
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 maxLength: 256
 *     responses:
 *       200:
 *         description: TOTP setup initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *                     provisioningUri:
 *                       type: string
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

    const secret = sails.helpers.utils.generateTotpSecret();
    const provisioningUri = sails.helpers.utils.buildTotpUri.with({
      account: user.email,
      secret,
      issuer: 'Planka',
    });

    // Only write the pending secret. Leave isTotpEnabled / totpEnabledAt /
    // totpRecoveryCodes alone — they only change in enable-totp / disable-totp.
    // Otherwise calling setup-totp while TOTP is already enabled would silently
    // disable 2FA on the server side (password alone could turn off the second factor).
    await User.qm.updateOne(user.id, {
      totpSecret: secret,
    });

    return {
      item: {
        secret,
        provisioningUri,
      },
    };
  },
};
