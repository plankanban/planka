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
