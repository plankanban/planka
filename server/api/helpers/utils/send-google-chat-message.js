module.exports = {
  inputs: {
    markdown: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
    };

    const body = {
      text: inputs.markdown,
    };

    let response;
    try {
      response = await fetch(sails.config.custom.googleChatWebhookUrl, {
        headers,
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      sails.log.error(`Error sending to Google Chat: ${error}`);
      return;
    }

    if (!response.ok) {
      sails.log.error(`Error sending to Google Chat: ${response.error}`);
      return;
    }

    const responseJson = await response.json();

    if (!responseJson.ok) {
      sails.log.error(`Error sending to Google Chat: ${responseJson.error}`);
    }
  },
};
