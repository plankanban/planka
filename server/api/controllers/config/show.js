/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /config:
 *   get:
 *     summary: Get application configuration
 *     description: Retrieves the application configuration.
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
 *     security: []
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const oidcClient = await sails.hooks.oidc.getClient();

    let oidc = null;
    if (oidcClient) {
      const authorizationUrlParams = {
        scope: sails.config.custom.oidcScopes,
      };

      if (!sails.config.custom.oidcUseDefaultResponseMode) {
        authorizationUrlParams.response_mode = sails.config.custom.oidcResponseMode;
      }

      oidc = {
        authorizationUrl: oidcClient.authorizationUrl(authorizationUrlParams),
        endSessionUrl: oidcClient.issuer.end_session_endpoint ? oidcClient.endSessionUrl({}) : null,
        isEnforced: sails.config.custom.oidcEnforced,
      };
    }

    return {
      item: sails.helpers.config.presentOne(
        {
          oidc,
        },
        currentUser,
      ),
    };
  },
};
