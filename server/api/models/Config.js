/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Config.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Config:
 *       type: object
 *       required:
 *         - version
 *         - oidc
 *       properties:
 *         version:
 *           type: string
 *           description: Current version of the PLANKA application
 *           example: 2.0.0
 *         activeUsersLimit:
 *           type: number
 *           nullable: true
 *           description: Maximum number of active users allowed (conditionally added for admins if configured)
 *           example: 100
 *         oidc:
 *           type: object
 *           required:
 *             - authorizationUrl
 *             - endSessionUrl
 *             - isEnforced
 *           nullable: true
 *           description: OpenID Connect configuration (null if not configured)
 *           properties:
 *             authorizationUrl:
 *               type: string
 *               format: uri
 *               description: OIDC authorization URL for initiating authentication
 *               example: https://oidc.example.com/auth
 *             endSessionUrl:
 *               type: string
 *               format: uri
 *               nullable: true
 *               description: OIDC end session URL for logout (null if not supported by provider)
 *               example: https://oidc.example.com/logout
 *             isEnforced:
 *               type: boolean
 *               description: Whether OIDC authentication is enforced (users must use OIDC to login)
 *               example: false
 */

const MAIN_ID = '1';

module.exports = {
  MAIN_ID,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    isInitialized: {
      type: 'boolean',
      required: true,
      columnName: 'is_initialized',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
  },
};
