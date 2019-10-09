module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const tasks = await sails.helpers.getTasks({
      cardId: inputs.id
    });

    return exits.success(tasks);
  }
};
