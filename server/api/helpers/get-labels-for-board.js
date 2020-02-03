module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value),
      required: true,
    },
  },

  async fn(inputs, exits) {
    const labels = await Label.find({
      boardId: inputs.id,
    }).sort('id');

    return exits.success(labels);
  },
};
