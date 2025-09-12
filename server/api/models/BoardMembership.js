/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BoardMembership.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardMembership:
 *       type: object
 *       required:
 *         - id
 *         - projectId
 *         - boardId
 *         - userId
 *         - role
 *         - canComment
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the board membership
 *           example: "1357158568008091264"
 *         projectId:
 *           type: string
 *           description: ID of the project the board membership belongs to (denormalized)
 *           example: "1357158568008091265"
 *         boardId:
 *           type: string
 *           description: ID of the board the membership is associated with
 *           example: "1357158568008091266"
 *         userId:
 *           type: string
 *           description: ID of the user who is a member of the board
 *           example: "1357158568008091267"
 *         role:
 *           type: string
 *           enum: [editor, viewer]
 *           description: Role of the user in the board
 *           example: editor
 *         canComment:
 *           type: boolean
 *           nullable: true
 *           description: Whether the user can comment on cards (applies only to viewers)
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the board membership was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the board membership was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Roles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

const SHARED_RULES = {
  role: {},
  canComment: { setTo: null },
};

const RULES_BY_ROLE = {
  [Roles.EDITOR]: {
    canComment: { setTo: null },
  },
  [Roles.VIEWER]: {
    canComment: { defaultTo: false },
  },
};

module.exports = {
  Roles,
  SHARED_RULES,
  RULES_BY_ROLE,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    role: {
      type: 'string',
      isIn: Object.values(Roles),
      required: true,
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
      columnName: 'can_comment',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    // Denormalization
    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
  },

  tableName: 'board_membership',
};
