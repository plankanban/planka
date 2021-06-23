module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    projectId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const projectManager = await ProjectManager.findOne({
      projectId: inputs.projectId,
      userId: inputs.id,
    });

    return !!projectManager;
  },
};
