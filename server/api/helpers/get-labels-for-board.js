module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const labels = await Label.find({
      boardId: inputs.id
    }).sort('id');

    return exits.success(labels);
  }
};
