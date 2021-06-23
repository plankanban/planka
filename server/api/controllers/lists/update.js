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

  async fn(inputs) {
    const { currentUser } = this.req;

    let { list } = await sails.helpers.lists
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, list.boardId);

    if (!isBoardMember) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name']);
    list = await sails.helpers.lists.updateOne(list, values, this.req);

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    return {
      item: list,
    };
  },
};
