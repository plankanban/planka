module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: value => _.isArray(value) || _.isPlainObject(value)
    }
  },

  fn: async function(inputs, exits) {
    const tasks = await Task.find(inputs.criteria).sort('id');

    return exits.success(tasks);
  }
};
