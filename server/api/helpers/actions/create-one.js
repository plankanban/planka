const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

const buildAndSendSlackMessage = async (user, card, action) => {
  const cardLink = `<${sails.config.custom.baseUrl}/cards/${card.id}|${card.name}>`;

  let markdown;
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      markdown = `${cardLink} was created by ${user.name} in *${action.data.list.name}*`;

      break;
    case Action.Types.MOVE_CARD:
      markdown = `${cardLink} was moved by ${user.name} to *${action.data.toList.name}*`;

      break;
    case Action.Types.COMMENT_CARD:
      markdown = `*${user.name}* commented on ${cardLink}:\n>${action.data.text}`;

      break;
    default:
      return;
  }

  await sails.helpers.utils.sendSlackMessage(markdown);
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const action = await Action.create({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'actionCreate',
      {
        item: action,
      },
      inputs.request,
    );

    const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
      action.cardId,
      action.userId,
    );

    await Promise.all(
      subscriptionUserIds.map(async (userId) =>
        sails.helpers.notifications.createOne.with({
          values: {
            userId,
            action,
          },
          user: values.user,
          board: inputs.board,
          card: values.card,
        }),
      ),
    );

    if (sails.config.custom.slackBotToken) {
      buildAndSendSlackMessage(values.user, values.card, action);
    }

    return action;
  },
};
