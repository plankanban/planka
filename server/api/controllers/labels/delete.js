const Errors = {
  LABEL_NOT_FOUND: {
    labelNotFound: 'Label not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    labelNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let { label } = await sails.helpers.labels
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.LABEL_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, label.boardId);

    if (!isBoardMember) {
      throw Errors.LABEL_NOT_FOUND; // Forbidden
    }

    label = await sails.helpers.labels.deleteOne(label, this.req);

    if (!label) {
      throw Errors.LABEL_NOT_FOUND;
    }

    return {
      item: label,
    };
  },
};
