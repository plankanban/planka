const moment = require('moment');

const Errors = {
  CARD_NOT_FOUND: {
    notFound: 'Card is not found'
  },
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
    listId: {
      type: 'number'
    },
    position: {
      type: 'number'
    },
    name: {
      type: 'string',
      isNotEmptyString: true
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true
    },
    dueDate: {
      type: 'string',
      custom: value => moment(value, moment.ISO_8601, true).isValid(),
      allowNull: true
    },
    timer: {
      type: 'json',
      custom: value =>
        _.isPlainObject(value) &&
        _.size(value) === 2 &&
        (_.isNull(value.startedAt) ||
          moment(value.startedAt, moment.ISO_8601, true).isValid()) &&
        _.isFinite(value.total)
    },
    isSubscribed: {
      type: 'boolean'
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    let { card, list, project } = await sails.helpers
      .getCardToProjectPath(inputs.id)
      .intercept('notFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    let toList;
    if (!_.isUndefined(inputs.listId) && inputs.listId !== list.id) {
      toList = await List.findOne({
        id: inputs.listId,
        boardId: card.boardId
      });

      if (!toList) {
        throw Errors.LIST_NOT_FOUND;
      }
    }

    const values = _.pick(inputs, [
      'position',
      'name',
      'description',
      'dueDate',
      'timer',
      'isSubscribed'
    ]);

    card = await sails.helpers.updateCard(
      card,
      values,
      toList,
      list,
      currentUser,
      this.req
    );

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    return exits.success({
      item: card
    });
  }
};
