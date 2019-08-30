const Errors = {
  TASK_NOT_FOUND: {
    notFound: 'Task is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    },
    name: {
      type: 'string',
      isNotEmptyString: true
    },
    isCompleted: {
      type: 'boolean'
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    let { task, board, project } = await sails.helpers
      .getTaskToProjectPath(inputs.id)
      .intercept('notFound', () => Errors.TASK_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.TASK_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name', 'isCompleted']);

    task = await sails.helpers.updateTask(task, values, board, this.req);

    if (!task) {
      throw Errors.TASK_NOT_FOUND;
    }

    return exits.success({
      item: task
    });
  }
};
