/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Roles = {
  ADMIN: 'admin',
  PROJECT_OWNER: 'projectOwner',
  BOARD_USER: 'boardUser',
};

// TODO: should not be here
const EditorModes = {
  WYSIWYG: 'wysiwyg',
  MARKUP: 'markup',
};

const HomeViews = {
  GRID_PROJECTS: 'gridProjects',
  GROUPED_PROJECTS: 'groupedProjects',
};

const ProjectOrders = {
  BY_DEFAULT: 'byDefault',
  ALPHABETICALLY: 'alphabetically',
  BY_CREATION_TIME: 'byCreationTime',
};

const LANGUAGES = [
  'ar-YE',
  'bg-BG',
  'cs-CZ',
  'da-DK',
  'de-DE',
  'el-GR',
  'en-GB',
  'en-US',
  'es-ES',
  'et-EE',
  'fa-IR',
  'fi-FI',
  'fr-FR',
  'hu-HU',
  'id-ID',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'nl-NL',
  'pl-PL',
  'pt-BR',
  'ro-RO',
  'ru-RU',
  'sk-SK',
  'sr-Cyrl-RS',
  'sr-Latn-RS',
  'sv-SE',
  'tr-TR',
  'uk-UA',
  'uz-UZ',
  'zh-CN',
  'zh-TW',
];

const PRIVATE_FIELD_NAMES = ['email', 'isSsoUser'];

const PERSONAL_FIELD_NAMES = [
  'language',
  'subscribeToOwnCards',
  'subscribeToCardWhenCommenting',
  'turnOffRecentCardHighlighting',
  'enableFavoritesByDefault',
  'defaultEditorMode',
  'defaultHomeView',
  'defaultProjectsOrder',
];

const OIDC = {
  id: '_oidc',
};

module.exports = {
  Roles,
  EditorModes,
  HomeViews,
  ProjectOrders,
  LANGUAGES,
  PRIVATE_FIELD_NAMES,
  PERSONAL_FIELD_NAMES,
  OIDC,

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
      isNotEmptyString: true,
      allowNull: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 32,
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
      isIn: LANGUAGES,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'subscribe_to_own_cards',
    },
    subscribeToCardWhenCommenting: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'subscribe_to_card_when_commenting',
    },
    turnOffRecentCardHighlighting: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'turn_off_recent_card_highlighting',
    },
    enableFavoritesByDefault: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'enable_favorites_by_default',
    },
    defaultEditorMode: {
      type: 'string',
      isIn: Object.values(EditorModes),
      defaultsTo: EditorModes.WYSIWYG,
      columnName: 'default_editor_mode',
    },
    defaultHomeView: {
      type: 'string',
      isIn: Object.values(HomeViews),
      defaultsTo: HomeViews.GROUPED_PROJECTS,
      columnName: 'default_home_view',
    },
    defaultProjectsOrder: {
      type: 'string',
      isIn: Object.values(ProjectOrders),
      defaultsTo: ProjectOrders.BY_DEFAULT,
      columnName: 'default_projects_order',
    },
    isSsoUser: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_sso_user',
    },
    isDeactivated: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_deactivated',
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
  },

  tableName: 'user_account',
};
