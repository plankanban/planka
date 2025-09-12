/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Board.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       required:
 *         - id
 *         - projectId
 *         - position
 *         - name
 *         - defaultView
 *         - defaultCardType
 *         - limitCardTypesToDefaultOne
 *         - alwaysDisplayCardCreator
 *         - expandTaskListsByDefault
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the board
 *           example: "1357158568008091264"
 *         projectId:
 *           type: string
 *           description: ID of the project the board belongs to
 *           example: "1357158568008091265"
 *         position:
 *           type: number
 *           description: Position of the board within the project
 *           example: 65536
 *         name:
 *           type: string
 *           description: Name/title of the board
 *           example: Development Board
 *         defaultView:
 *           type: string
 *           enum: [kanban, grid, list]
 *           default: kanban
 *           description: Default view for the board
 *           example: kanban
 *         defaultCardType:
 *           type: string
 *           enum: [project, story]
 *           default: project
 *           description: Default card type for new cards
 *           example: project
 *         limitCardTypesToDefaultOne:
 *           type: boolean
 *           default: false
 *           description: Whether to limit card types to default one
 *           example: false
 *         alwaysDisplayCardCreator:
 *           type: boolean
 *           default: false
 *           description: Whether to always display the card creator
 *           example: false
 *         expandTaskListsByDefault:
 *           type: boolean
 *           default: false
 *           description: Whether to expand task lists by default
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the board was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the board was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Card = require('./Card');

const Views = {
  KANBAN: 'kanban',
  GRID: 'grid',
  LIST: 'list',
};

const ImportTypes = {
  TRELLO: 'trello',
};

module.exports = {
  Views,
  ImportTypes,

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
    defaultView: {
      type: 'string',
      isIn: Object.values(Views),
      defaultsTo: Views.KANBAN,
      columnName: 'default_view',
    },
    defaultCardType: {
      type: 'string',
      isIn: Object.values(Card.Types),
      defaultsTo: Card.Types.PROJECT,
      columnName: 'default_card_type',
    },
    limitCardTypesToDefaultOne: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'limit_card_types_to_default_one',
    },
    alwaysDisplayCardCreator: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'always_display_card_creator',
    },
    expandTaskListsByDefault: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'expand_task_lists_by_default',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
    memberUsers: {
      collection: 'User',
      via: 'boardId',
      through: 'BoardMembership',
    },
    lists: {
      collection: 'List',
      via: 'boardId',
    },
    labels: {
      collection: 'Label',
      via: 'boardId',
    },
  },
};
