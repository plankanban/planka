const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
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
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    labelNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.labels
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.LABEL_NOT_FOUND);

    let { label } = path;
    const { board, project } = path;

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.LABEL_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['position', 'name', 'color']);

    label = await sails.helpers.labels.updateOne.with({
      values,
      project,
      board,
      record: label,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: label,
    };
  },
};
