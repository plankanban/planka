const services = require('../../services/slack');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    text: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR && !boardMembership.canComment) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = {
      type: Action.Types.COMMENT_CARD,
      data: _.pick(inputs, ['text']),
    };

    const action = await sails.helpers.actions.createOne.with({
      values: {
        ...values,
        card,
        user: currentUser,
      },
      request: this.req,
    });

    const cardUrl = services.buildCardUrl(card);
    const messageText = '*' + currentUser.username + '* commented on ' + cardUrl + ':\n>' + inputs.text;
    services.sendSlackMessage(messageText)
      .then(() => { console.log('Slack message sent successfully.'); })
      .catch((error) => { console.error('Failed to send Slack message:', error.message); });

    return {
      item: action,
    };
  },
};
