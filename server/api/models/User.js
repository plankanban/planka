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
    },
    isAdmin: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_admin',
    },
    isSso: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_sso',
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
    avatar: {
      type: 'json',
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
    language: {
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
    passwordChangedAt: {
      type: 'ref',
      columnName: 'password_changed_at',
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
    identityProviders: {
      collection: 'IdentityProviderUser',
      via: 'userId',
    },
  },

  tableName: 'user_account',

  customToJSON() {
    const isDefaultAdmin = this.email === sails.config.custom.defaultAdminEmail;

    return {
      ..._.omit(this, ['password', 'isSso', 'avatar', 'passwordChangedAt']),
      isLocked: this.isSso || isDefaultAdmin,
      isRoleLocked: (this.isSso && !sails.config.custom.oidcIgnoreRoles) || isDefaultAdmin,
      isDeletionLocked: isDefaultAdmin,
      avatarUrl:
        this.avatar &&
        `${sails.config.custom.userAvatarsUrl}/${this.avatar.dirname}/square-100.${this.avatar.extension}`,
    };
  },
};
