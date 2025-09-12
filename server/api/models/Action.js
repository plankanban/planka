/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Action.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Action:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - cardId
 *         - userId
 *         - type
 *         - data
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the action
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           nullable: true
 *           description: ID of the board where the action occurred
 *           example: "1357158568008091265"
 *         cardId:
 *           type: string
 *           description: ID of the card where the action occurred
 *           example: "1357158568008091266"
 *         userId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who performed the action
 *           example: "1357158568008091267"
 *         type:
 *           type: string
 *           enum: [createCard, moveCard, addMemberToCard, removeMemberFromCard, completeTask, uncompleteTask]
 *           description: Type of the action
 *           example: moveCard
 *         data:
 *           type: object
 *           description: Action specific data (varies by type)
 *           example: {"card": {"name": "Implement user authentication"}, "toList": {"id": "1357158568008091268", "name": "To Do", "type": "active"}, "fromList": {"id": "1357158568008091269", "name": "Done", "type": "closed"}}
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the action was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the action was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Types = {
  CREATE_CARD: 'createCard',
  MOVE_CARD: 'moveCard',
  ADD_MEMBER_TO_CARD: 'addMemberToCard',
  REMOVE_MEMBER_FROM_CARD: 'removeMemberFromCard',
  COMPLETE_TASK: 'completeTask',
  UNCOMPLETE_TASK: 'uncompleteTask',
};

const INTERNAL_NOTIFIABLE_TYPES = [Types.MOVE_CARD, Types.ADD_MEMBER_TO_CARD];
const EXTERNAL_NOTIFIABLE_TYPES = [Types.CREATE_CARD, Types.MOVE_CARD];
const PERSONAL_NOTIFIABLE_TYPES = [Types.ADD_MEMBER_TO_CARD];

module.exports = {
  Types,
  INTERNAL_NOTIFIABLE_TYPES,
  EXTERNAL_NOTIFIABLE_TYPES,
  PERSONAL_NOTIFIABLE_TYPES,

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

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      columnName: 'board_id',
    },
    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    userId: {
      model: 'User',
      columnName: 'user_id',
    },
  },
};
