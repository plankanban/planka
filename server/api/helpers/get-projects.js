module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
  },

  async fn(inputs, exits) {
    const projects = await Project.find(inputs.criteria).sort('id');

    return exits.success(projects);
  },
};
