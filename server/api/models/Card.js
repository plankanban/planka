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
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true
    },
    deadline: {
      type: 'ref'
    },
    timer: {
      type: 'json'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    listId: {
      model: 'List',
      required: true,
      columnName: 'list_id'
    },
    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id'
    },
    subscriptionUsers: {
      collection: 'User',
      via: 'cardId',
      through: 'CardSubscription'
    },
    membershipUsers: {
      collection: 'User',
      via: 'cardId',
      through: 'CardMembership'
    },
    labels: {
      collection: 'Label',
      via: 'cardId',
      through: 'CardLabel'
    },
    tasks: {
      collection: 'Task',
      via: 'cardId'
    }
  }
};
