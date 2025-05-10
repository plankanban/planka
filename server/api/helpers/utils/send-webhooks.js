/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const EVENT_TYPES = {
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
};

/**
 * @typedef {Object} Included
 * @property {any[]} [users] - Array of users (optional).
 * @property {any[]} [projects] - Array of projects (optional).
 * @property {any[]} [baseCustomFieldGroups] - Array of base custom field groups (optional).
 * @property {any[]} [boards] - Array of boards (optional).
 * @property {any[]} [boardMemberships] - Array of board memberships (optional).
 * @property {any[]} [labels] - Array of labels (optional).
 * @property {any[]} [lists] - Array of lists (optional).
 * @property {any[]} [cards] - Array of cards (optional).
 * @property {any[]} [cardMemberships] - Array of card memberships (optional).
 * @property {any[]} [taskLists] - Array of task lists (optional).
 * @property {any[]} [customFieldGroups] - Array of custom field groups (optional).
 * @property {any[]} [customFields] - Array of custom fields (optional).
 * @property {any[]} [comments] - Array of comments (optional).
 * @property {any[]} [actions] - Array of actions (optional).
 */

/**
 * @typedef {Object} Data
 * @property {any} item - Actual event data.
 * @property {Included} [included] - Optional included data.
 */

/**
 * Sends a webhook notification to a configured URL.
 *
 * @param {*} webhook - Webhook configuration.
 * @param {string} event - The event (see {@link EVENT_TYPES}).
 * @param {Data} data - The data object containing event data and optionally included data.
 * @param {Data} [prevData] - The data object containing previous state of data (optional).
 * @param {ref} user - User object associated with the event.
 * @returns {Promise<void>}
 */
async function sendWebhook(webhook, event, data, prevData, user) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': `planka (+${sails.config.custom.baseUrl})`,
  };

  if (webhook.accessToken) {
    headers.Authorization = `Bearer ${webhook.accessToken}`;
  }

  const body = JSON.stringify({
    event,
    data,
    prevData,
    user,
  });

  try {
    const response = await fetch(webhook.url, {
      headers,
      body,
      method: 'POST',
    });

    if (!response.ok) {
      const message = await response.text();

      sails.log.error(
        `Webhook ${webhook.url} failed with status ${response.status} and message: ${message}`,
      );
    }
  } catch (error) {
    sails.log.error(`Webhook ${webhook.url} failed with error: ${error}`);
  }
}

module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
      isIn: Object.values(EVENT_TYPES),
    },
    buildData: {
      type: 'ref',
      required: true,
    },
    buildPrevData: {
      type: 'ref',
    },
    user: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    if (!sails.config.custom.webhooks) {
      return;
    }

    const webhooks = sails.config.custom.webhooks.filter((webhook) => {
      if (!webhook.url) {
        return false;
      }

      if (webhook.excludedEvents && webhook.excludedEvents.includes(inputs.event)) {
        return false;
      }

      if (webhook.events && !webhook.events.includes(inputs.event)) {
        return false;
      }

      return true;
    });

    if (webhooks.length === 0) {
      return;
    }

    const data = inputs.buildData();
    const prevData = inputs.buildPrevData && inputs.buildPrevData();

    webhooks.forEach((webhook) => {
      sendWebhook(
        webhook,
        inputs.event,
        data,
        prevData,
        sails.helpers.users.presentOne(inputs.user),
      );
    });
  },
};
