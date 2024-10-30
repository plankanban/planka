const EVENT_TYPES = {
  ACTION_CREATE: 'actionCreate',
  ACTION_DELETE: 'actionDelete',
  ACTION_UPDATE: 'actionUpdate',

  ATTACHMENT_CREATE: 'attachmentCreate',
  ATTACHMENT_DELETE: 'attachmentDelete',
  ATTACHMENT_UPDATE: 'attachmentUpdate',

  BOARD_CREATE: 'boardCreate',
  BOARD_DELETE: 'boardDelete',
  BOARD_UPDATE: 'boardUpdate',

  BOARD_MEMBERSHIP_CREATE: 'boardMembershipCreate',
  BOARD_MEMBERSHIP_DELETE: 'boardMembershipDelete',
  BOARD_MEMBERSHIP_UPDATE: 'boardMembershipUpdate',

  CARD_CREATE: 'cardCreate',
  CARD_DELETE: 'cardDelete',
  CARD_UPDATE: 'cardUpdate',

  CARD_LABEL_CREATE: 'cardLabelCreate',
  CARD_LABEL_DELETE: 'cardLabelDelete',

  CARD_MEMBERSHIP_CREATE: 'cardMembershipCreate',
  CARD_MEMBERSHIP_DELETE: 'cardMembershipDelete',

  LABEL_CREATE: 'labelCreate',
  LABEL_DELETE: 'labelDelete',
  LABEL_UPDATE: 'labelUpdate',

  LIST_CREATE: 'listCreate',
  LIST_DELETE: 'listDelete',
  LIST_SORT: 'listSort',
  LIST_UPDATE: 'listUpdate',

  NOTIFICATION_CREATE: 'notificationCreate',
  NOTIFICATION_UPDATE: 'notificationUpdate',

  PROJECT_CREATE: 'projectCreate',
  PROJECT_DELETE: 'projectDelete',
  PROJECT_UPDATE: 'projectUpdate',

  PROJECT_MANAGER_CREATE: 'projectManagerCreate',
  PROJECT_MANAGER_DELETE: 'projectManagerDelete',

  TASK_CREATE: 'taskCreate',
  TASK_DELETE: 'taskDelete',
  TASK_UPDATE: 'taskUpdate',

  USER_CREATE: 'userCreate',
  USER_DELETE: 'userDelete',
  USER_UPDATE: 'userUpdate',
};

const jsonifyData = (data) => {
  const nextData = {};

  if (data.item) {
    nextData.item = sails.helpers.utils.jsonifyRecord(data.item);
  }

  if (data.items) {
    nextData.items = data.items.map((item) => sails.helpers.utils.jsonifyRecord(item));
  }

  if (data.included) {
    nextData.included = Object.entries(data.included).reduce(
      (result, [key, items]) => ({
        ...result,
        [key]: items.map((item) => sails.helpers.utils.jsonifyRecord(item)),
      }),
      {},
    );
  }

  return nextData;
};

/**
 * @typedef {Object} Included
 * @property {any[]} [projects] - Array of projects (optional).
 * @property {any[]} [boards] - Array of boards (optional).
 * @property {any[]} [lists] - Array of lists (optional).
 * @property {any[]} [cards] - Array of cards (optional).
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
    data: jsonifyData(data),
    prevData: prevData && jsonifyData(prevData),
    user: sails.helpers.utils.jsonifyRecord(user),
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
    data: {
      type: 'ref',
      required: true,
    },
    prevData: {
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

    sails.config.custom.webhooks.forEach((webhook) => {
      if (!webhook.url) {
        return;
      }

      if (webhook.excludedEvents && webhook.excludedEvents.includes(inputs.event)) {
        return;
      }

      if (webhook.events && !webhook.events.includes(inputs.event)) {
        return;
      }

      sendWebhook(webhook, inputs.event, inputs.data, inputs.prevData, inputs.user);
    });
  },
};
