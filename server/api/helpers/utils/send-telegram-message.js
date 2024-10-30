const buildSendMessageApiUrl = (telegramBotToken) =>
  `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

module.exports = {
  inputs: {
    html: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
    };

    const body = {
      chat_id: sails.config.custom.telegramChatId,
      text: inputs.html,
      parse_mode: 'HTML',
    };

    if (sails.config.custom.telegramThreadId) {
      body.message_thread_id = sails.config.custom.telegramThreadId;
    }

    let response;
    try {
      response = await fetch(buildSendMessageApiUrl(sails.config.custom.telegramBotToken), {
        headers,
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      sails.log.error(`Error sending to Telegram: ${error}`);
      return;
    }

    if (!response.ok) {
      const responseJson = await response.json();
      sails.log.error(`Error sending to Telegram: ${responseJson.description}`);
    }
  },
};
