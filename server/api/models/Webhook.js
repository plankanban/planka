/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Webhook.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Events = {
  ACTION_CREATE: 'actionCreate',

  ATTACHMENT_CREATE: 'attachmentCreate',
  ATTACHMENT_UPDATE: 'attachmentUpdate',
  ATTACHMENT_DELETE: 'attachmentDelete',

  BACKGROUND_IMAGE_CREATE: 'backgroundImageCreate',
  BACKGROUND_IMAGE_DELETE: 'backgroundImageDelete',

  BASE_CUSTOM_FIELD_GROUP_CREATE: 'baseCustomFieldGroupCreate',
  BASE_CUSTOM_FIELD_GROUP_UPDATE: 'baseCustomFieldGroupUpdate',
  BASE_CUSTOM_FIELD_GROUP_DELETE: 'baseCustomFieldGroupDelete',

  BOARD_CREATE: 'boardCreate',
  BOARD_UPDATE: 'boardUpdate',
  BOARD_DELETE: 'boardDelete',

  BOARD_MEMBERSHIP_CREATE: 'boardMembershipCreate',
  BOARD_MEMBERSHIP_UPDATE: 'boardMembershipUpdate',
  BOARD_MEMBERSHIP_DELETE: 'boardMembershipDelete',

  CARD_CREATE: 'cardCreate',
  CARD_UPDATE: 'cardUpdate',
  CARD_DELETE: 'cardDelete',

  CARD_LABEL_CREATE: 'cardLabelCreate',
  CARD_LABEL_DELETE: 'cardLabelDelete',

  CARD_MEMBERSHIP_CREATE: 'cardMembershipCreate',
  CARD_MEMBERSHIP_DELETE: 'cardMembershipDelete',

  COMMENT_CREATE: 'commentCreate',
  COMMENT_UPDATE: 'commentUpdate',
  COMMENT_DELETE: 'commentDelete',

  CUSTOM_FIELD_CREATE: 'customFieldCreate',
  CUSTOM_FIELD_UPDATE: 'customFieldUpdate',
  CUSTOM_FIELD_DELETE: 'customFieldDelete',

  CUSTOM_FIELD_GROUP_CREATE: 'customFieldGroupCreate',
  CUSTOM_FIELD_GROUP_UPDATE: 'customFieldGroupUpdate',
  CUSTOM_FIELD_GROUP_DELETE: 'customFieldGroupDelete',

  CUSTOM_FIELD_VALUE_UPDATE: 'customFieldValueUpdate',
  CUSTOM_FIELD_VALUE_DELETE: 'customFieldValueDelete',

  LABEL_CREATE: 'labelCreate',
  LABEL_UPDATE: 'labelUpdate',
  LABEL_DELETE: 'labelDelete',

  LIST_CREATE: 'listCreate',
  LIST_UPDATE: 'listUpdate',
  LIST_CLEAR: 'listClear',
  LIST_DELETE: 'listDelete',

  NOTIFICATION_CREATE: 'notificationCreate',
  NOTIFICATION_UPDATE: 'notificationUpdate',

  NOTIFICATION_SERVICE_CREATE: 'notificationServiceCreate',
  NOTIFICATION_SERVICE_UPDATE: 'notificationServiceUpdate',
  NOTIFICATION_SERVICE_DELETE: 'notificationServiceDelete',

  PROJECT_CREATE: 'projectCreate',
  PROJECT_UPDATE: 'projectUpdate',
  PROJECT_DELETE: 'projectDelete',

  PROJECT_MANAGER_CREATE: 'projectManagerCreate',
  PROJECT_MANAGER_DELETE: 'projectManagerDelete',

  TASK_CREATE: 'taskCreate',
  TASK_UPDATE: 'taskUpdate',
  TASK_DELETE: 'taskDelete',

  TASK_LIST_CREATE: 'taskListCreate',
  TASK_LIST_UPDATE: 'taskListUpdate',
  TASK_LIST_DELETE: 'taskListDelete',

  USER_CREATE: 'userCreate',
  USER_UPDATE: 'userUpdate',
  USER_DELETE: 'userDelete',

  WEBHOOK_CREATE: 'webhookCreate',
  WEBHOOK_UPDATE: 'webhookUpdate',
  WEBHOOK_DELETE: 'webhookDelete',
};

module.exports = {
  Events,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    url: {
      type: 'string',
      required: true,
    },
    accessToken: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'access_token',
    },
    events: {
      type: 'ref',
      columnType: 'text[]',
    },
    excludedEvents: {
      type: 'ref',
      columnType: 'text[]',
      columnName: 'excluded_events',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      columnName: 'board_id',
    },
  },
};
