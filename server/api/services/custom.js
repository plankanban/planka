const axios = require('axios');
const slackPostUrl = 'https://slack.com/api/chat.postMessage';
const channelId = process.env.SLACK_CHANNEL_ID;
const slackAPIToken = process.env.SLACK_BOT_TOKEN;
const plankaProdUrl = process.env.BASE_URL;

async function sendSlackMessage(messageText) {
    if (!slackAPIToken) {
        throw new Error('No Slack BOT token found');
    }

    console.log('Sending to Slack');


    const postData = {
        blocks: [ {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: messageText,
          },
        }]
      };

    try {
      // Prod path
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${slackAPIToken}`,
        },
      };

      axios.post(slackPostUrl, { ...postData, channel: channelId }, config)
        .then(response => {
            console.log('Slack response:', response.data);
        })
        .catch(error => {
            console.error('Error sending to Slack:', error.message);
        });


      // Testing in dev environment (Brad)
      /*
      const response = await axios.post(plankaTestWebhookUrl, postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      */

      console.log('Slack response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending to Slack:', error.message);
      throw error;
    }
  }

  function buildCardUrl(card) {
    const url = plankaProdUrl + '/cards/' + card.id;
    const cardUrl = '<' + url + '|' + card.name + '>';
    console.log(cardUrl);
    return cardUrl;
  }

  module.exports = {
    sendSlackMessage,
    buildCardUrl
  };
