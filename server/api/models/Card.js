/**
 * Card.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

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
    timer: {
      type: 'json',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    listId: {
      model: 'List',
      columnName: 'list_id',
    },
    creatorUserId: {
      model: 'User',
      columnName: 'creator_user_id',
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
    tasks: {
      collection: 'Task',
      via: 'cardId',
    },
    attachments: {
      collection: 'Attachment',
      via: 'cardId',
    },
    actions: {
      collection: 'Action',
      via: 'cardId',
    },
  },
};
