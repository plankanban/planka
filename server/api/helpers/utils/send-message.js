function buildMessage(user, card, action) {
  const cardLink = `<${sails.config.custom.baseUrl}/cards/${card.id}|${card.name}>`;

  let markdown;
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      markdown = `${cardLink} was created by ${user.name} in *${action.data.list.name}*`;
      break;
    case Action.Types.MOVE_CARD:
      markdown = `${cardLink} was moved by ${user.name} to *${action.data.toList.name}*`;
      break;
    case Action.Types.COMMENT_CARD:
      markdown = `*${user.name}* commented on ${cardLink}:\n>${action.data.text}`;
      break;
    case Action.Types.DELETE_COMMENT_CARD:
      markdown = `Comment on ${cardLink} was deleted by ${user.name}`;
      break;
    case Action.Types.DELETE_CARD:
      markdown = `${cardLink} was deleted by ${user.name}`;
      break;
    default:
      return '';
  }

  return markdown;
}

const handleSlack = () => {
  const POST_MESSAGE_API_URL = 'https://slack.com/api/chat.postMessage';

  function getTokens() {
    if (!sails.config.custom.slackBotToken || !sails.config.custom.slackChannelId) {
      return false;
    }
    return {
      token: sails.config.custom.slackBotToken,
      channel: sails.config.custom.slackChannelId,
    };
  }

  const send = async ({ action, user, card }) => {
    const tokens = getTokens();
    if (!tokens) {
      return;
    }

    const markdown = buildMessage(user, card, action);

    if (!markdown) {
      sails.log.warn('Missing message markdown. Skipping Slack message. Action:', action.type);
      return;
    }

    const data = {
      channel: tokens.channel,
      text: markdown,
      as_user: false,
      username: user.name,
      icon_url: user.avatarUrl,
    };

    try {
      const response = await fetch(POST_MESSAGE_API_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${tokens.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        sails.log.error('Failed to send Slack message:', errorData);
      } else {
        const responseJson = await response.json();
        sails.log.debug('Slack message sent successfully:', responseJson);
      }
    } catch (error) {
      sails.log.error('Error sending Slack message:', error);
    }
  };

  return {
    send,
  };
};

const handleWebhook = () => {
  function getWebhookUrl() {
    return sails.config.custom.webhookUrl || false;
  }

  function buildHeaders() {
    const bearer = sails.config.custom.webhookBearerToken || false;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (bearer) {
      headers.Authorization = `Bearer ${bearer}`;
    }

    return headers;
  }

  const send = async ({ action, user, card, board }) => {
    const url = getWebhookUrl();
    if (!url) {
      return;
    }

    const markdown = buildMessage(user, card, action);

    const data = {
      text: markdown,
      action,
      board,
      card,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        sails.log.error('Failed to send Webhook message:', errorData);
      } else {
        sails.log.debug('Webhook message sent successfully.');
      }
    } catch (error) {
      sails.log.error('Error sending Webhook message:', error);
    }
  };

  return {
    send,
  };
};

module.exports = {
  inputs: {
    action: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const slack = handleSlack();
    const webhook = handleWebhook();

    await Promise.allSettled([slack.send(inputs), webhook.send(inputs)]);
  },
};
