/**
 * Project.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
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
