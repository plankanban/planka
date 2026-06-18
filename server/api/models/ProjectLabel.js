/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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

  tableName: 'project_label',

  attributes: {
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

    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
  },
};
