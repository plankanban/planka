module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    cardId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const cardSubscription = await CardSubscription.findOne({
      cardId: inputs.cardId,
      userId: inputs.id,
    });

    return !!cardSubscription;
  },
};
