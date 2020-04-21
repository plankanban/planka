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

  async fn(inputs, exits) {
    const attachment = await Attachment.findOne(inputs.criteria);

    if (!attachment) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers
      .getCardToProjectPath(attachment.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          attachment,
          ...nodes,
        },
      }));

    return exits.success({
      attachment,
      ...path,
    });
  },
};
