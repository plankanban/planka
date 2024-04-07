const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.user) && !_.isString(value.userId)) {
    return false;
  }

  if (!_.isPlainObject(value.action)) {
    return false;
  }

  return true;
};

// TODO: use templates (views) to build html
const buildAndSendEmail = async (user, board, card, action, notifiableUser) => {
  let emailData;
  switch (action.type) {
    case Action.Types.MOVE_CARD:
      emailData = {
        subject: `${user.name} moved ${card.name} from ${action.data.fromList.name} to ${action.data.toList.name} on ${board.name}`,
        html:
          `<p>${user.name} moved ` +
          `<a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> ` +
          `from ${action.data.fromList.name} to ${action.data.toList.name} ` +
          `on <a href="${process.env.BASE_URL}/boards/${board.id}">${board.name}</a></p>`,
      };

      break;
    case Action.Types.COMMENT_CARD:
      emailData = {
        subject: `${user.name} left a new comment to ${card.name} on ${board.name}`,
        html:
          `<p>${user.name} left a new comment to ` +
          `<a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> ` +
          `on <a href="${process.env.BASE_URL}/boards/${board.id}">${board.name}</a></p>` +
          `<p>${action.data.text}</p>`,
      };

      break;
    default:
      return;
  }

  await sails.helpers.utils.sendEmail.with({
    ...emailData,
    to: notifiableUser.email,
  });
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.user) {
      values.userId = values.user.id;
    }

    const notification = await Notification.create({
      ...values,
      actionId: values.action.id,
      cardId: values.action.cardId,
    }).fetch();

    sails.sockets.broadcast(`user:${notification.userId}`, 'notificationCreate', {
      item: notification,
    });

    if (sails.hooks.smtp.isActive()) {
      let notifiableUser;
      if (values.user) {
        notifiableUser = values.user;
      } else {
        notifiableUser = await sails.helpers.users.getOne(notification.userId);
      }

      buildAndSendEmail(inputs.user, inputs.board, inputs.card, values.action, notifiableUser);
    }

    return notification;
  },
};
