const slackPostUrl = 'https://slack.com/api/chat.postMessage';
const channelId = process.env.SLACK_CHANNEL_ID;
const slackAPIToken = process.env.SLACK_BOT_TOKEN;
const plankaProdUrl = process.env.BASE_URL;

async function sendSlackMessage(messageText) {
  if (!slackAPIToken) {
    throw new Error('No Slack BOT token found');
  }

  const postData = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: messageText,
        },
      },
    ],
    channel: channelId,
  };

  const config = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${slackAPIToken}`,
    },
  };

  const response = await fetch(slackPostUrl, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    sails.log.Error('Error sending to Slack :', response.error);
    return Promise.reject(response);
  }

  const responseText = await new Response(response.body).text();
  const jsonBody = JSON.parse(responseText);
  if (!jsonBody.ok) {
    sails.log.Error('Error sending to Slack :', jsonBody.error);
    return Promise.reject(response);
  }

  return response;
}

function buildCardUrl(card) {
  const url = `${plankaProdUrl}/cards/${card.id}`;
  const cardUrl = `<${url}|${card.name}>`;
  return cardUrl;
}

module.exports = {
  sendSlackMessage,
  buildCardUrl,
};
