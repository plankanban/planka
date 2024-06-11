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

const buildAndSendSlackMessage = async (card, action, actorUser) => {
  const cardLink = `<${sails.config.custom.baseUrl}/cards/${card.id}|${card.name}>`;

  let markdown;
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      markdown = `${cardLink} was created by ${actorUser.name} in *${action.data.list.name}*`;

      break;
    case Action.Types.MOVE_CARD:
      markdown = `${cardLink} was moved by ${actorUser.name} to *${action.data.toList.name}*`;

      break;
    case Action.Types.COMMENT_CARD:
      markdown = `*${actorUser.name}* commented on ${cardLink}:\n>${action.data.text}`;

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
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
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

    sails.helpers.utils.sendWebhooks.with({
      event: 'actionCreate',
      data: {
        item: action,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      },
      user: values.user,
    });

    if (sails.config.custom.slackBotToken) {
      buildAndSendSlackMessage(values.card, action, values.user);
    }

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
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
          card: values.card,
          actorUser: values.user,
        }),
      ),
    );

    return action;
  },
};
