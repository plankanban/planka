const Errors = {
  LIST_NOT_FOUND: {
    notFound: 'List is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    },
    position: {
      type: 'number'
    },
    name: {
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

    let { list, project } = await sails.helpers
      .getListToProjectPath(inputs.id)
      .intercept('notFound', () => Errors.LIST_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name']);

    list = await sails.helpers.updateList(list, values, this.req);

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    return exits.success({
      item: list
    });
  }
};
