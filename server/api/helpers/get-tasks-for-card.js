module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
  },

  async fn(inputs, exits) {
    const tasks = await sails.helpers.getTasks({
      cardId: inputs.id,
    });

    return exits.success(tasks);
  },
};
