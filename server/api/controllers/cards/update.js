const moment = require('moment');

const Errors = {
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
      custom: (value) => moment(value, moment.ISO_8601, true).isValid(),
      allowNull: true,
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
    isSubscribed: {
      type: 'boolean',
    },
  },

  exits: {
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

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const cardToProjectPath = await sails.helpers
      .getCardToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    let { card, project } = cardToProjectPath;
    const { list, board } = cardToProjectPath;

    let isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    let toBoard;
    if (!_.isUndefined(inputs.boardId)) {
      ({ board: toBoard, project } = await sails.helpers
        .getBoardToProjectPath(inputs.boardId)
        .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND));

      isUserMemberForProject = await sails.helpers.isUserMemberForProject(
        project.id,
        currentUser.id,
      );

      if (!isUserMemberForProject) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }
    }

    let toList;
    if (!_.isUndefined(inputs.listId)) {
      toList = await List.findOne({
        id: inputs.listId,
        boardId: (toBoard || board).id,
      });

      if (!toList) {
        throw Errors.LIST_NOT_FOUND; // Forbidden
      }
    }

    const values = _.pick(inputs, [
      'coverAttachmentId',
      'position',
      'name',
      'description',
      'dueDate',
      'timer',
      'isSubscribed',
    ]);

    card = await sails.helpers
      .updateCard(card, toBoard, toList, values, board, list, currentUser, this.req)
      .intercept('toListMustBePresent', () => Errors.LIST_MUST_BE_PRESENT)
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    return exits.success({
      item: card,
    });
  },
};
