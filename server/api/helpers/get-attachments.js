module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
  },

  async fn(inputs, exits) {
    const attachments = await Attachment.find(inputs.criteria).sort('id');

    return exits.success(attachments);
  },
};
