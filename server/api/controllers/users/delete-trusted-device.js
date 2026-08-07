/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/trusted-devices/{deviceId}:
 *   delete:
 *     summary: Revoke a specific trusted device
 *     description: Deletes one trusted-device row, forcing TOTP again on that browser at next login. Only accessible for the user themselves.
 *     tags:
 *       - Users
 *     operationId: deleteUserTrustedDevice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trusted device revoked
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  TRUSTED_DEVICE_NOT_FOUND: {
    trustedDeviceNotFound: 'Trusted device not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    deviceId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    trustedDeviceNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id !== currentUser.id) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const deleted = await TrustedDevice.qm.deleteOneByUserIdAndId(currentUser.id, inputs.deviceId);
    if (!deleted) {
      throw Errors.TRUSTED_DEVICE_NOT_FOUND;
    }

    return {
      item: sails.helpers.trustedDevices.presentOne(deleted),
    };
  },
};
