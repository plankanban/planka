module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true
    },
    userId: {
      type: 'string',
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
