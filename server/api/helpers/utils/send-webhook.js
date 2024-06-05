const EVENT_TYPES = {
  ACTION_CREATE: 'action_create',
  ACTION_UPDATE: 'action_update',
  ACTION_DELETE: 'action_delete',

  CARD_CREATE: 'card_create',
  CARD_UPDATE: 'card_update',
  CARD_DELETE: 'card_delete',

  LIST_CREATE: 'list_create',
  LIST_UPDATE: 'list_update',
  LIST_DELETE: 'list_delete',

  BOARD_CREATE: 'board_create',
  BOARD_UPDATE: 'board_update',
  BOARD_DELETE: 'board_delete',

  ATTACHMENT_CREATE: 'attachment_create',
  ATTACHMENT_UPDATE: 'attachment_update',
  ATTACHMENT_DELETE: 'attachment_delete',

  PROJECT_CREATE: 'project_create',
  PROJECT_UPDATE: 'project_update',
  PROJECT_DELETE: 'project_delete',

  TASK_CREATE: 'task_create',
  TASK_UPDATE: 'task_update',
  TASK_DELETE: 'task_delete',
};

/**
 * Sends a webhook notification to a configured URL.
 *
 * @param {Object} inputs - Data to include in the webhook payload.
 * @param {string} inputs.event - The event type (see {@link EVENT_TYPES}).
 * @param {*} inputs.data - The actual data related to the event.
 * @param {string} inputs.projectId - The project ID associated with the event.
 * @param {ref} [inputs.user] - Optional user object associated with the event.
 * @param {ref} [inputs.card] - Optional card object associated with the event.
 * @param {ref} [inputs.board] - Optional board object associated with the event.
 * @param {ref} [inputs.list] - Optional list object associated with the event.
 * @returns {Promise<void>}
 */
async function sendWebhook(inputs) {
  const url = sails.config.custom.webhookUrl;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (sails.config.custom.webhookBearer) {
    headers.Authorization = `Bearer ${sails.config.custom.webhookBearer}`;
  }

  const body = JSON.stringify({
    ...inputs,
    user: {
      id: inputs.user.id,
      fullName: inputs.user.fullName,
      email: inputs.user.email,
    },
  });

  const req = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });
  if (req.status !== 200) {
    sails.log.error(`Webhook failed with status ${req.status} and message: ${await req.text()}`);
  }
}

module.exports = {
  eventTypes: EVENT_TYPES,
  inputs: {
    event: {
      type: 'string',
      isIn: Object.keys(EVENT_TYPES),
      required: true,
    },
    data: {
      type: 'ref',
      required: true,
    },
    projectId: {
      type: 'string',
      required: true,
    },
    user: {
      type: 'ref',
    },
    card: {
      type: 'ref',
    },
    board: {
      type: 'ref',
    },
    list: {
      type: 'ref',
    },
  },
  async fn(inputs) {
    if (!sails.config.custom.webhookUrl) return;
    try {
      await sendWebhook(inputs);
    } catch (err) {
      sails.log.error(err);
    }
  },
};
