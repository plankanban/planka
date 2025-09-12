/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /webhooks/{id}:
 *   delete:
 *     summary: Delete webhook
 *     description: Deletes a webhook. Requires admin privileges.
 *     tags:
 *       - Webhooks
 *     operationId: deleteWebhook
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the webhook to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Webhook deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Webhook'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  WEBHOOK_NOT_FOUND: {
    webhookNotFound: 'Webhook not found',
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
    webhookNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let webhook = await Webhook.qm.getOneById(inputs.id);

    if (!webhook) {
      throw Errors.WEBHOOK_NOT_FOUND;
    }

    webhook = await sails.helpers.webhooks.deleteOne.with({
      record: webhook,
      actorUser: currentUser,
      request: this.req,
    });

    if (!webhook) {
      throw Errors.WEBHOOK_NOT_FOUND;
    }

    return {
      item: webhook,
    };
  },
};
