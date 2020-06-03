/**
 * Project.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const BACKGROUND_TYPES = ['gradient', 'image'];

const BACKGROUND_GRADIENTS = [
  'old-lime',
  'ocean-dive',
  'tzepesch-style',
  'jungle-mesh',
  'strawberry-dust',
  'purple-rose',
  'sun-scream',
  'warm-rust',
  'sky-change',
  'green-eyes',
  'blue-xchange',
  'blood-orange',
  'sour-peel',
  'green-ninja',
  'algae-green',
  'coral-reef',
  'steel-grey',
  'heat-waves',
  'velvet-lounge',
  'purple-rain',
  'blue-steel',
  'blueish-curve',
  'prism-light',
  'green-mist',
  'red-curtain',
];

module.exports = {
  BACKGROUND_TYPES,
  BACKGROUND_GRADIENTS,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    background: {
      type: 'json',
    },
    backgroundImageDirname: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'background_image_dirname',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    membershipUsers: {
      collection: 'User',
      via: 'projectId',
      through: 'ProjectMembership',
    },
    boards: {
      collection: 'Board',
      via: 'projectId',
    },
  },

  customToJSON() {
    return {
      ..._.omit(this, ['backgroundImageDirname']),
      backgroundImage: this.backgroundImageDirname && {
        url: `${sails.config.custom.projectBackgroundImagesUrl}/${this.backgroundImageDirname}/original.jpg`,
        coverUrl: `${sails.config.custom.projectBackgroundImagesUrl}/${this.backgroundImageDirname}/cover-336.jpg`,
      },
    };
  },
};
