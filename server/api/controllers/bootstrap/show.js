/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /bootstrap:
 *   get:
 *     summary: Get application bootstrap
 *     description: Retrieves the application bootstrap.
 *     tags:
 *       - Bootstrap
 *     operationId: getBootstrap
 *     responses:
 *       200:
 *         description: Bootstrap retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - version
 *               properties:
 *                 activeUsersLimit:
 *                   type: number
 *                   nullable: true
 *                   description: Maximum number of active users allowed (conditionally added for admins if configured)
 *                   example: 100
 *                 customerPanelUrl:
 *                   type: string
 *                   format: uri
 *                   description: URL to the customer management panel (conditionally added for admins if configured)
 *                   example: https://panel.example.com
 *                 termsLanguages:
 *                   type: array
 *                   description: List of available language codes for terms localization
 *                   items:
 *                     type: string
 *                   example: [de-DE, en-US]
 *                 version:
 *                   type: string
 *                   description: Current version of the PLANKA application
 *                   example: 2.0.0
 *     security: []
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const internalConfig = await InternalConfig.qm.getOneMain();

    return {
      item: sails.helpers.bootstrap.presentOne(internalConfig, currentUser),
    };
  },
};
