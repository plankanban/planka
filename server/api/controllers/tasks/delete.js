const Errors = {
  TASK_NOT_FOUND: {
    notFound: 'Task is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true
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

    task = await sails.helpers.deleteTask(task, board, this.req);

    if (!task) {
      throw Errors.TASK_NOT_FOUND;
    }

    return exits.success({
      item: task
    });
  }
};
