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

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.tasks
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.TASK_NOT_FOUND);

    let { task } = path;
    const { board } = path;

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      throw Errors.TASK_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name', 'isCompleted']);
    task = await sails.helpers.tasks.updateOne(task, values, board, this.req);

    if (!task) {
      throw Errors.TASK_NOT_FOUND;
    }

    return {
      item: task,
    };
  },
};
