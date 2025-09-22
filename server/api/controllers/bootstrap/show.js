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
 *                 - oidc
 *                 - version
 *               properties:
 *                 oidc:
 *                   type: object
 *                   required:
 *                     - authorizationUrl
 *                     - endSessionUrl
 *                     - isEnforced
 *                   nullable: true
 *                   description: OpenID Connect configuration (null if not configured)
 *                   properties:
 *                     authorizationUrl:
 *                       type: string
 *                       format: uri
 *                       description: OIDC authorization URL for initiating authentication
 *                       example: https://oidc.example.com/auth
 *                     endSessionUrl:
 *                       type: string
 *                       format: uri
 *                       nullable: true
 *                       description: OIDC end session URL for logout (null if not supported by provider)
 *                       example: https://oidc.example.com/logout
 *                     isEnforced:
 *                       type: boolean
 *                       description: Whether OIDC authentication is enforced (users must use OIDC to login)
 *                       example: false
 *                 activeUsersLimit:
 *                   type: number
 *                   nullable: true
 *                   description: Maximum number of active users allowed (conditionally added for admins if configured)
 *                   example: 100
 *                 version:
 *                   type: string
 *                   description: Current version of the PLANKA application
 *                   example: 2.0.0
 *     security: []
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const oidc = await sails.hooks.oidc.getBootstrap();

    return {
      item: sails.helpers.bootstrap.presentOne(oidc, currentUser),
    };
  },
};
