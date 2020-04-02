const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const listToProjectPath = await sails.helpers
      .getListToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    let { list } = listToProjectPath;
    const { project } = listToProjectPath;

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
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
      item: list,
    });
  },
};
