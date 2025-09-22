/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /config:
 *   get:
 *     summary: Get application configuration
 *     description: Retrieves the application configuration. Requires admin privileges.
 *     tags:
 *       - Config
 *     operationId: getConfig
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Config'
 */

module.exports = {
  async fn() {
    const config = await Config.qm.getOneMain();

    return {
      item: sails.helpers.config.presentOne(config),
    };
  },
};
