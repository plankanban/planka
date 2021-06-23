/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    isAdmin: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_admin',
    },
    name: {
      type: 'string',
      required: true,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
    },
    avatarDirname: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'avatar_dirname',
    },
    phone: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    organization: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'subscribe_to_own_cards',
    },
    deletedAt: {
      type: 'ref',
      columnName: 'deleted_at',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    managerProjects: {
      collection: 'Project',
      via: 'userId',
      through: 'ProjectManager',
    },
    membershipBoards: {
      collection: 'Board',
      via: 'userId',
      through: 'BoardMembership',
    },
    subscriptionCards: {
      collection: 'Card',
      via: 'userId',
      through: 'CardSubscription',
    },
    membershipCards: {
      collection: 'Card',
      via: 'userId',
      through: 'CardMembership',
    },
  },

  tableName: 'user_account',

  customToJSON() {
    return {
      ..._.omit(this, ['password', 'avatarDirname']),
      avatarUrl:
        this.avatarDirname &&
        `${sails.config.custom.userAvatarsUrl}/${this.avatarDirname}/square-100.jpg`,
    };
  },
};
