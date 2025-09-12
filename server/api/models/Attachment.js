/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Attachment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Attachment:
 *       type: object
 *       required:
 *         - id
 *         - cardId
 *         - creatorUserId
 *         - type
 *         - data
 *         - name
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the attachment
 *           example: "1357158568008091264"
 *         cardId:
 *           type: string
 *           description: ID of the card the attachment belongs to
 *           example: "1357158568008091265"
 *         creatorUserId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who created the attachment
 *           example: "1357158568008091266"
 *         type:
 *           type: string
 *           enum: [file, link]
 *           description: Type of the attachment
 *           example: link
 *         data:
 *           type: object
 *           description: Attachment specific data (varies by type)
 *           example: {"url": "https://google.com/search?q=planka", "faviconUrl": "https://storage.example.com/favicons/google.com.png"}
 *         name:
 *           type: string
 *           description: Name/title of the attachment
 *           example: Important Attachment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the attachment was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the attachment was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Types = {
  FILE: 'file',
  LINK: 'link',
};

module.exports = {
  Types,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    type: {
      type: 'string',
      isIn: Object.values(Types),
      required: true,
    },
    data: {
      type: 'json',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    creatorUserId: {
      model: 'User',
      columnName: 'creator_user_id',
    },
  },
};
