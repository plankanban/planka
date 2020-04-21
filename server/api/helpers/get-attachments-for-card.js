module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
  },

  async fn(inputs, exits) {
    const attachments = await sails.helpers.getAttachments({
      cardId: inputs.id,
    });

    return exits.success(attachments);
  },
};
