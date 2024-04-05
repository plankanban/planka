const services = require('../../services/slack');

module.exports = {
  inputs: {
    record: {
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

      const messageText = `*${card.name}* was deleted by ${inputs.request.name}`;
      services.sendSlackMessage(messageText).catch((error) => {
        sails.log.error('Failed to send Slack message:', error.message);
      });
    }

    return card;
  },
};
