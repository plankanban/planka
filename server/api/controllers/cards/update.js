const moment = require('moment');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  LIST_MUST_BE_PRESENT: {
    listMustBePresent: 'List must be present',
  },
  POSITION_MUST_BE_PRESENT: {
    positionMustBePresent: 'Position must be present',
  },
};

const dueDateValidator = (value) => moment(value, moment.ISO_8601, true).isValid();

const stopwatchValidator = (value) => {
  if (!_.isPlainObject(value) || _.size(value) !== 2) {
    return false;
  }

  if (
    !_.isNull(value.startedAt) &&
    _.isString(value.startedAt) &&
    !moment(value.startedAt, moment.ISO_8601, true).isValid()
  ) {
    return false;
  }

  if (!_.isFinite(value.total)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    coverAttachmentId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      custom: dueDateValidator,
      allowNull: true,
    },
    isDueDateCompleted: {
      type: 'boolean',
      allowNull: true,
    },
    stopwatch: {
      type: 'json',
      custom: stopwatchValidator,
    },
    isSubscribed: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    listMustBePresent: {
      responseType: 'unprocessableEntity',
    },
    positionMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.cards
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    let { card } = path;
    const { list, board, project } = path;

    let boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let nextProject;
    let nextBoard;

    if (!_.isUndefined(inputs.boardId)) {
      ({ board: nextBoard, project: nextProject } = await sails.helpers.boards
        .getProjectPath(inputs.boardId)
        .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND));

      boardMembership = await BoardMembership.findOne({
        boardId: nextBoard.id,
        userId: currentUser.id,
      });

      if (!boardMembership) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let nextList;
    if (!_.isUndefined(inputs.listId)) {
      nextList = await List.findOne({
        id: inputs.listId,
        boardId: (nextBoard || board).id,
      });

      if (!nextList) {
        throw Errors.LIST_NOT_FOUND; // Forbidden
      }
    }

    const values = _.pick(inputs, [
      'coverAttachmentId',
      'position',
      'name',
      'description',
      'dueDate',
      'isDueDateCompleted',
      'stopwatch',
      'isSubscribed',
    ]);

    card = await sails.helpers.cards.updateOne
      .with({
        project,
        board,
        list,
        record: card,
        values: {
          ...values,
          project: nextProject,
          board: nextBoard,
          list: nextList,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT)
      .intercept('listMustBeInValues', () => Errors.LIST_MUST_BE_PRESENT);

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    return {
      item: card,
    };
  },
};
