const Errors = {
  PROJECT_NOT_FOUND: {
    notFound: 'Project is not found'
  }
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true
    },
    position: {
      type: 'number',
      required: true
    },
    name: {
      type: 'string',
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const values = _.pick(inputs, ['position', 'name']);

    const board = await sails.helpers.createBoard(project, values, this.req);

    return exits.success({
      item: board,
      included: {
        lists: [],
        labels: []
      }
    });
  }
};
