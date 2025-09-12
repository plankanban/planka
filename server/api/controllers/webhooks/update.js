/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /webhooks/{id}:
 *   patch:
 *     summary: Update webhook
 *     description: Updates a webhook. Requires admin privileges.
 *     tags:
 *       - Webhooks
 *     operationId: updateWebhook
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the webhook to update
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
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the webhook
 *                 example: Webhook Updates
 *               url:
 *                 type: string
 *                 format: url
 *                 maxLength: 2048
 *                 description: URL endpoint for the webhook
 *                 example: https://service.example.com/planka
 *               accessToken:
 *                 type: string
 *                 maxLength: 512
 *                 nullable: true
 *                 description: Access token for webhook authentication
 *                 example: secret_token_123
 *               events:
 *                 type: string
 *                 maxLength: 2048
 *                 nullable: true
 *                 description: Comma-separated list of events that trigger the webhook
 *                 example: cardCreate,cardUpdate,cardDelete
 *               excludedEvents:
 *                 type: string
 *                 maxLength: 2048
 *                 nullable: true
 *                 description: Comma-separated list of events excluded from the webhook
 *                 example: userCreate,userUpdate,userDelete
 *     responses:
 *       200:
 *         description: Webhook updated successfully
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

const { isUrl } = require('../../../utils/validators');
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
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    url: {
      type: 'string',
      maxLength: 2048,
      custom: isUrl,
    },
    accessToken: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 512,
      allowNull: true,
    },
    events: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 2048,
      allowNull: true,
    },
    excludedEvents: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 2048,
      allowNull: true,
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

    const values = _.pick(inputs, ['name', 'url', 'accessToken']);
    const events = inputs.events && inputs.events.split(',');
    const excludedEvents = inputs.excludedEvents && inputs.excludedEvents.split(',');

    webhook = await sails.helpers.webhooks.updateOne.with({
      record: webhook,
      values: {
        ...values,
        events,
        excludedEvents,
      },
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
