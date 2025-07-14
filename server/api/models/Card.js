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
