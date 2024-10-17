const POST_MESSAGE_API_URL = 'https://slack.com/api/chat.postMessage';

module.exports = {
  // TODO: make sync?

  inputs: {
    markdown: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const headers = {
      Authorization: `Bearer ${sails.config.custom.slackBotToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    };

    const body = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: inputs.markdown,
          },
        },
      ],
      channel: sails.config.custom.slackChannelId,
    };

    let response;
    try {
      response = await fetch(POST_MESSAGE_API_URL, {
        headers,
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      sails.log.error(`Error sending to Slack: ${error}`);
      return;
    }

    if (!response.ok) {
      sails.log.error(`Error sending to Slack: ${response.error}`);
      return;
    }

    const responseJson = await response.json();

    if (!responseJson.ok) {
      sails.log.error(`Error sending to Slack: ${responseJson.error}`);
    }
  },
};
