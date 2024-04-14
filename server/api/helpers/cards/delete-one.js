const buildAndSendMessage = async (user, card, send) => {
  await send(`*${card.name}* was deleted by ${user.name}`);
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const card = await Card.archiveOne(inputs.record.id);

    if (card) {
      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardDelete',
        {
          item: card,
        },
        inputs.request,
      );

      if (sails.config.custom.slackBotToken) {
        buildAndSendMessage(inputs.user, card, sails.helpers.utils.sendSlackMessage);
      }
      if (sails.config.custom.googleChatWebhookUrl) {
        buildAndSendMessage(inputs.user, card, sails.helpers.utils.sendSlackMessage);
      }
    }

    return card;
  },
};
