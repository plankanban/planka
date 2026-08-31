/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

const Webhook = require('../../models/Webhook');

const BOARD_ITEM_EVENTS = new Set([
  Webhook.Events.BOARD_CREATE,
  Webhook.Events.BOARD_UPDATE,
  Webhook.Events.BOARD_DELETE,
]);

const PROJECT_ITEM_EVENTS = new Set([
  Webhook.Events.PROJECT_CREATE,
  Webhook.Events.PROJECT_UPDATE,
  Webhook.Events.PROJECT_DELETE,
]);

function resolveScope(event, data, override) {
  const result = { projectId: null, boardId: null, ...(override || {}) };
  if (!data) return result;

  const { item } = data;
  const included = data.included || {};

  if (!result.projectId) {
    if (included.projects && included.projects[0]) {
      result.projectId = included.projects[0].id;
    } else if (item && PROJECT_ITEM_EVENTS.has(event)) {
      result.projectId = item.id;
    } else if (item && item.projectId) {
      result.projectId = item.projectId;
    }
  }

  if (!result.boardId) {
    if (included.boards && included.boards[0]) {
      result.boardId = included.boards[0].id;
    } else if (item && BOARD_ITEM_EVENTS.has(event)) {
      result.boardId = item.id;
    } else if (item && item.boardId) {
      result.boardId = item.boardId;
    }
  }

  return result;
}

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
 * @param {string} event - The event.
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
      dispatcher: sails.config.custom.outgoingProxy
        ? new ProxyAgent(sails.config.custom.outgoingProxy)
        : undefined,
    });

    if (!response.ok) {
      const message = await response.text();

      sails.log.error(
        `Webhook ${webhook.name} failed with status ${response.status} and message: ${message}`,
      );
    }
  } catch (error) {
    sails.log.error(`Webhook ${webhook.name} failed with error: ${error}`);
  }
}

module.exports = {
  sync: true,

  inputs: {
    webhooks: {
      type: 'ref',
      required: true,
    },
    event: {
      type: 'string',
      required: true,
      isIn: Object.values(Webhook.Events),
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
    scope: {
      type: 'ref',
    },
  },

  fn(inputs) {
    const userId = inputs.user && inputs.user.id;

    const eventFilteredWebhooks = inputs.webhooks.filter((webhook) => {
      if (!webhook.url) {
        return false;
      }

      if (webhook.excludedEvents && webhook.excludedEvents.includes(inputs.event)) {
        return false;
      }

      if (webhook.events && !webhook.events.includes(inputs.event)) {
        return false;
      }

      if (webhook.userId && webhook.userId !== userId) {
        return false;
      }

      return true;
    });

    if (eventFilteredWebhooks.length === 0) {
      return;
    }

    const data = inputs.buildData();
    const prevData = inputs.buildPrevData && inputs.buildPrevData();

    const scope = resolveScope(inputs.event, data, inputs.scope);

    const webhooks = eventFilteredWebhooks.filter((webhook) => {
      if (webhook.projectId && webhook.projectId !== scope.projectId) {
        return false;
      }

      if (webhook.boardId && webhook.boardId !== scope.boardId) {
        return false;
      }

      return true;
    });

    if (webhooks.length === 0) {
      return;
    }

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
