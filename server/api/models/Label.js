/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Label.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const COLORS = [
  'muddy-grey',
  'autumn-leafs',
  'morning-sky',
  'antique-blue',
  'egg-yellow',
  'desert-sand',
  'dark-granite',
  'fresh-salad',
  'lagoon-blue',
  'midnight-blue',
  'light-orange',
  'pumpkin-orange',
  'light-concrete',
  'sunny-grass',
  'navy-blue',
  'lilac-eyes',
  'apricot-red',
  'orange-peel',
  'silver-glint',
  'bright-moss',
  'deep-ocean',
  'summer-sky',
  'berry-red',
  'light-cocoa',
  'grey-stone',
  'tank-green',
  'coral-green',
  'sugar-plum',
  'pink-tulip',
  'shady-rust',
  'wet-rock',
  'wet-moss',
  'turquoise-sea',
  'lavender-fields',
  'piggy-red',
  'light-mud',
  'gun-metal',
  'modern-green',
  'french-coast',
  'sweet-lilac',
  'red-burgundy',
  'pirate-gold',
];

module.exports = {
  COLORS,

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
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: COLORS,
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
      required: true,
      columnName: 'board_id',
    },
    cards: {
      collection: 'Card',
      via: 'labelId',
      through: 'CardLabel',
    },
  },
};
