const moment = require('moment');

const Errors = {
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

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      custom: (value) => moment(value, moment.ISO_8601, true).isValid(),
    },
    timer: {
      type: 'json',
      custom: (value) => {
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
      },
    },
  },

  exits: {
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

    const { board } = await sails.helpers.boards
      .getProjectPath(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    let list;
    if (!_.isUndefined(inputs.listId)) {
      list = await List.findOne({
        id: inputs.listId,
        boardId: board.id,
      });

      if (!list) {
        throw Errors.LIST_NOT_FOUND;
      }
    }

    const values = _.pick(inputs, ['position', 'name', 'description', 'dueDate', 'timer']);

    const card = await sails.helpers.cards
      .createOne(values, currentUser, board, list, this.req)
      .intercept('listMustBePresent', () => Errors.LIST_MUST_BE_PRESENT)
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    return {
      item: card,
    };
  },
};
