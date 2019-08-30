const Errors = {
  COMMENT_ACTION_NOT_FOUND: {
    notFound: 'Comment action is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    },
    text: {
      type: 'string',
      isNotEmptyString: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    let { action, board, project } = await sails.helpers
      .getActionToProjectPath({
        id: inputs.id,
        type: 'commentCard',
        userId: currentUser.id
      })
      .intercept('notFound', () => Errors.COMMENT_ACTION_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.COMMENT_ACTION_NOT_FOUND; // Forbidden
    }

    const values = {
      data: _.pick(inputs, ['text'])
    };

    action = await sails.helpers.updateAction(action, values, board, this.req);

    if (!action) {
      throw Errors.COMMENT_ACTION_NOT_FOUND;
    }

    return exits.success({
      item: action
    });
  }
};
