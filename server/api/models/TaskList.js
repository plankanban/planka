/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * TaskList.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskList:
 *       type: object
 *       required:
 *         - id
 *         - cardId
 *         - position
 *         - name
 *         - showOnFrontOfCard
 *         - hideCompletedTasks
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the task list
 *           example: "1357158568008091264"
 *         cardId:
 *           type: string
 *           description: ID of the card the task list belongs to
 *           example: "1357158568008091265"
 *         position:
 *           type: number
 *           description: Position of the task list within the card
 *           example: 65536
 *         name:
 *           type: string
 *           description: Name/title of the task list
 *           example: Development Tasks
 *         showOnFrontOfCard:
 *           type: boolean
 *           default: true
 *           description: Whether to show the task list on the front of the card
 *           example: true
 *         hideCompletedTasks:
 *           type: boolean
 *           default: false
 *           description: Whether to hide completed tasks
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the task list was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the task list was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    showOnFrontOfCard: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'show_on_front_of_card',
    },
    hideCompletedTasks: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'hide_completed_tasks',
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
  },

  tableName: 'task_list',
};
