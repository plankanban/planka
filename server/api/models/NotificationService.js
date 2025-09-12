/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * NotificationService.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationService:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - boardId
 *         - url
 *         - format
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the notification service
 *           example: "1357158568008091264"
 *         userId:
 *           type: string
 *           nullable: true
 *           description: ID of the user the service is associated with
 *           example: "1357158568008091265"
 *         boardId:
 *           type: string
 *           nullable: true
 *           description: ID of the board the service is associated with
 *           example: "1357158568008091266"
 *         url:
 *           type: string
 *           description: URL endpoint for notifications
 *           example: https://service.example.com/planka
 *         format:
 *           type: string
 *           enum: [text, markdown, html]
 *           description: Format for notification messages
 *           example: text
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the notification service was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the notification service was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Formats = {
  TEXT: 'text',
  MARKDOWN: 'markdown',
  HTML: 'html',
};

module.exports = {
  Formats,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    url: {
      type: 'string',
      required: true,
    },
    format: {
      type: 'string',
      isIn: Object.values(Formats),
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    userId: {
      model: 'User',
      columnName: 'user_id',
    },
    boardId: {
      model: 'Board',
      columnName: 'board_id',
    },
  },

  tableName: 'notification_service',
};
