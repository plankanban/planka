/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}/api-key:
 *   post:
 *     summary: Create user API key
 *     description: Generates a user's API key. The full API key is returned only once and cannot be retrieved again.
 *     tags:
 *       - Users
 *     operationId: createUserApiKey
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to create API key for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/User'
 *                 included:
 *                   type: object
 *                   required:
 *                     - apiKey
 *                   properties:
 *                     apiKey:
 *                       type: string
 *                       description: API key of the user (returned only once)
 *                       example: D89VszVs_oSS6TdDtYmi0j1LhugOioY40dDVssESO
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
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
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let user = await User.qm.getOneById(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const { key: apiKey, prefix: apiKeyPrefix } = sails.helpers.utils.generateApiKey();

    user = await sails.helpers.users.updateOne.with({
      record: user,
      values: {
        apiKeyPrefix,
        apiKeyHash: sails.helpers.utils.hash(apiKey),
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
      included: {
        apiKey,
      },
    };
  },
};
