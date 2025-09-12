/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /webhooks:
 *   get:
 *     summary: Get all webhooks
 *     description: Retrieves a list of all configured webhooks. Requires admin privileges.
 *     tags:
 *       - Webhooks
 *     operationId: getWebhooks
 *     responses:
 *       200:
 *         description: List of webhooks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Webhook'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = {
  async fn() {
    const webhooks = await Webhook.qm.getAll();

    return {
      items: webhooks,
    };
  },
};
