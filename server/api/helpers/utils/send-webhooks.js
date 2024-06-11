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
 * Sends a webhook notification to a configured URL.
 *
 * @param {*} webhook - Webhook configuration.
 * @param {string} event - The event (see {@link Events}).
 * @param {*} data - The actual data related to the event.
 * @param {ref} user - User object associated with the event.
 * @returns {Promise<void>}
 */
async function sendWebhook(webhook, event, data, user) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (webhook.accessToken) {
    headers.Authorization = `Bearer ${webhook.accessToken}`;
  }

  const body = JSON.stringify({
    event,
    data: jsonifyData(data),
    user: sails.helpers.utils.jsonifyRecord(user),
  });

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
}

module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
    },
    data: {
      type: 'ref',
      required: true,
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

      sendWebhook(webhook, inputs.event, inputs.data, inputs.user);
    });
  },
};
