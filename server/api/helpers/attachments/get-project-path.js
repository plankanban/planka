module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const attachment = await Attachment.findOne(inputs.criteria);

    if (!attachment) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.cards
      .getProjectPath(attachment.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          attachment,
          ...nodes,
        },
      }));

    return {
      attachment,
      ...path,
    };
  },
};
