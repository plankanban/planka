/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /webhooks:
 *   post:
 *     summary: Create webhook
 *     description: Creates a webhook. Requires admin privileges.
 *     tags:
 *       - Webhooks
 *     operationId: createWebhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
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
 *         description: Webhook created successfully
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
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const { isUrl } = require('../../../utils/validators');

const Errors = {
  LIMIT_REACHED: {
    limitReached: 'Limit reached',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    url: {
      type: 'string',
      maxLength: 2048,
      custom: isUrl,
      required: true,
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
    limitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name', 'url', 'accessToken']);
    const events = inputs.events && inputs.events.split(',');
    const excludedEvents = inputs.excludedEvents && inputs.excludedEvents.split(',');

    const webhook = await sails.helpers.webhooks.createOne
      .with({
        values: {
          ...values,
          events,
          excludedEvents,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('limitReached', () => Errors.LIMIT_REACHED);

    return {
      item: webhook,
    };
  },
};
