const Errors = {
  COMMENT_ACTION_NOT_FOUND: {
    notFound: 'Comment action is not found'
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

    const criteria = {
      id: inputs.id,
      type: 'commentCard'
    };

    if (!currentUser.isAdmin) {
      criteria.userId = currentUser.id;
    }

    let { action, board, project } = await sails.helpers
      .getActionToProjectPath(criteria)
      .intercept('notFound', () => Errors.COMMENT_ACTION_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.COMMENT_ACTION_NOT_FOUND; // Forbidden
    }

    action = await sails.helpers.deleteAction(action, board, this.req);

    if (!action) {
      throw Errors.COMMENT_ACTION_NOT_FOUND;
    }

    return exits.success({
      item: action
    });
  }
};
