/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/trusted-devices:
 *   get:
 *     summary: List active trusted devices
 *     description: Returns the user's currently-valid trusted browsers. Only accessible for the user themselves.
 *     tags:
 *       - Users
 *     operationId: indexUserTrustedDevices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of trusted devices
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
  },

  exits: {
    notEnoughRights: {
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

    const devices = await TrustedDevice.qm.getActiveByUserId(user.id);

    return {
      items: devices.map((d) => sails.helpers.trustedDevices.presentOne(d)),
    };
  },
};
