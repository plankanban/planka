module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    },
    userId: {
      type: 'number',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const projectMembership = await ProjectMembership.findOne({
      projectId: inputs.id,
      userId: inputs.userId
    });

    return exits.success(!!projectMembership);
  }
};
