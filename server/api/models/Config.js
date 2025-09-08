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
 *         - id
 *         - isInitialized
 *         - version
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the config (always set to '1')
 *           example: 1
 *         isInitialized:
 *           type: boolean
 *           description: Whether the PLANKA instance has been initialized
 *           example: true
 *         version:
 *           type: string
 *           description: Current version of the PLANKA application
 *           example: 2.0.0
 *         activeUsersLimit:
 *           type: number
 *           nullable: true
 *           description: Maximum number of active users allowed (conditionally added for admins if configured)
 *           example: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the config was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the config was last updated
 *           example: 2024-01-01T00:00:00.000Z
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
