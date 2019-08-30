module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const projectMemberships = await sails.helpers.getProjectMemberships({
      userId: inputs.id
    });

    return exits.success(projectMemberships);
  }
};
