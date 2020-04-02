const Errors = {
  TASK_NOT_FOUND: {
    taskNotFound: 'Task not found',
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
    isCompleted: {
      type: 'boolean',
    },
  },

  exits: {
    taskNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const taskToProjectPath = await sails.helpers
      .getTaskToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.TASK_NOT_FOUND);

    let { task } = taskToProjectPath;
    const { board, project } = taskToProjectPath;

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
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
      item: task,
    });
  },
};
