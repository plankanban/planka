const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    background: {
      type: 'json',
      custom: (value) => {
        if (_.isNull(value)) {
          return true;
        }

        if (!_.isPlainObject(value)) {
          return false;
        }

        if (!Project.BACKGROUND_TYPES.includes(value.type)) {
          return false;
        }

        if (
          value.type === 'gradient' &&
          _.size(value) === 2 &&
          Project.BACKGROUND_GRADIENTS.includes(value.name)
        ) {
          return true;
        }

        if (value.type === 'image' && _.size(value) === 1) {
          return true;
        }

        return false;
      },
    },
    backgroundImage: {
      type: 'json',
      custom: (value) => _.isNull(value),
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    let project = await Project.findOne(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const values = _.pick(inputs, ['name', 'background', 'backgroundImage']);

    project = await sails.helpers.updateProject(project, values, this.req);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    return exits.success({
      item: project,
    });
  },
};
