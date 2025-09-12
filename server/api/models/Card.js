/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Card.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - listId
 *         - creatorUserId
 *         - prevListId
 *         - coverAttachmentId
 *         - type
 *         - position
 *         - name
 *         - description
 *         - dueDate
 *         - isDueCompleted
 *         - stopwatch
 *         - commentsTotal
 *         - isClosed
 *         - listChangedAt
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the card
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           description: ID of the board the card belongs to (denormalized)
 *           example: "1357158568008091265"
 *         listId:
 *           type: string
 *           description: ID of the list the card belongs to
 *           example: "1357158568008091266"
 *         creatorUserId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who created the card
 *           example: "1357158568008091267"
 *         prevListId:
 *           type: string
 *           nullable: true
 *           description: ID of the previous list the card was in (available when in archive or trash)
 *           example: "1357158568008091268"
 *         coverAttachmentId:
 *           type: string
 *           nullable: true
 *           description: ID of the attachment used as cover
 *           example: "1357158568008091269"
 *         type:
 *           type: string
 *           enum: [project, story]
 *           description: Type of the card
 *           example: project
 *         position:
 *           type: number
 *           nullable: true
 *           description: Position of the card within the list
 *           example: 65536
 *         name:
 *           type: string
 *           description: Name/title of the card
 *           example: Implement user authentication
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the card
 *           example: Add JWT-based authentication system...
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Due date for the card
 *           example: 2024-01-01T00:00:00.000Z
 *         isDueCompleted:
 *           type: boolean
 *           nullable: true
 *           description: Whether the due date is completed
 *           example: false
 *         stopwatch:
 *           type: object
 *           required:
 *             - startedAt
 *             - total
 *           nullable: true
 *           description: Stopwatch data for time tracking
 *           properties:
 *             startedAt:
 *               type: string
 *               format: date-time
 *               description: When the stopwatch was started
 *               example: 2024-01-01T00:00:00.000Z
 *             total:
 *               type: number
 *               description: Total time in seconds
 *               example: 3600
 *         commentsTotal:
 *           type: number
 *           default: 0
 *           description: Total number of comments on the card
 *           example: 100
 *         isClosed:
 *           type: boolean
 *           default: false
 *           description: Whether the card is closed
 *           example: false
 *         listChangedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the card was last moved between lists
 *           example: 2024-01-01T00:00:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the card was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the card was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Types = {
  PROJECT: 'project',
  STORY: 'story',
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
    position: {
      type: 'number',
      allowNull: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'ref',
      columnName: 'due_date',
    },
    isDueCompleted: {
      type: 'boolean',
      allowNull: true,
      columnName: 'is_due_completed',
    },
    stopwatch: {
      type: 'json',
    },
    commentsTotal: {
      type: 'number',
      defaultsTo: 0,
      columnName: 'comments_total',
    },
    isClosed: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_closed',
    },
    listChangedAt: {
      type: 'ref',
      columnName: 'list_changed_at',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    // Denormalization
    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    listId: {
      model: 'List',
      required: true,
      columnName: 'list_id',
    },
    creatorUserId: {
      model: 'User',
      columnName: 'creator_user_id',
    },
    prevListId: {
      model: 'List',
      columnName: 'prev_list_id',
    },
    coverAttachmentId: {
      model: 'Attachment',
      columnName: 'cover_attachment_id',
    },
    subscriptionUsers: {
      collection: 'User',
      via: 'cardId',
      through: 'CardSubscription',
    },
    memberUsers: {
      collection: 'User',
      via: 'cardId',
      through: 'CardMembership',
    },
    labels: {
      collection: 'Label',
      via: 'cardId',
      through: 'CardLabel',
    },
    taskLists: {
      collection: 'TaskList',
      via: 'cardId',
    },
    attachments: {
      collection: 'Attachment',
      via: 'cardId',
    },
    comments: {
      collection: 'Comment',
      via: 'cardId',
    },
    actions: {
      collection: 'Action',
      via: 'cardId',
    },
  },
};
