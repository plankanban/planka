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
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
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

    const values = _.pick(inputs, ['name', 'color']);
    label = await sails.helpers.labels.updateOne(label, values, this.req);

    return {
      item: label,
    };
  },
};
