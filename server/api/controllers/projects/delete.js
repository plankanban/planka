const Errors = {
  PROJECT_NOT_FOUND: {
    notFound: 'Project is not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    let project = await Project.findOne(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    project = await sails.helpers.deleteProject(project, this.req);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    return exits.success({
      item: project,
    });
  },
};
