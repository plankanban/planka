const moment = require('moment');

const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
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
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    boardId: {
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
      custom: (value) =>
        _.isPlainObject(value) &&
        _.size(value) === 2 &&
        (_.isNull(value.startedAt) || moment(value.startedAt, moment.ISO_8601, true).isValid()) &&
        _.isFinite(value.total),
    },
    isSubscribed: {
      type: 'boolean',
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const cardToProjectPath = await sails.helpers
      .getCardToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    let { card, project } = cardToProjectPath;
    const { list } = cardToProjectPath;

    let isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    let toList;
    if (!_.isUndefined(inputs.listId) && inputs.listId !== list.id) {
      toList = await List.findOne({
        id: inputs.listId,
        boardId: inputs.boardId || card.boardId,
      });

      if (!toList) {
        throw Errors.LIST_NOT_FOUND;
      }

      ({ project } = await sails.helpers
        .getListToProjectPath(toList.id)
        .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND));

      isUserMemberForProject = await sails.helpers.isUserMemberForProject(
        project.id,
        currentUser.id,
      );

      if (!isUserMemberForProject) {
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

    card = await sails.helpers.updateCard(card, values, toList, list, currentUser, this.req);

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    return exits.success({
      item: card,
    });
  },
};
