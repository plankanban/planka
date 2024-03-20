const nodemailer = require('nodemailer');

const emailTransporter =
  process.env.SMTP_HOST &&
  nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

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

async function sendEmailNotification({ notification, action }) {
  const actionUser = await sails.helpers.users.getOne(action.userId);
  const actionCard = await Card.findOne(action.cardId);
  const notificationUser = await sails.helpers.users.getOne(notification.userId);
  const actionBoard = await Board.findOne(actionCard.boardId);
  let email;
  switch (action.type) {
    case Action.Types.COMMENT_CARD:
      email = {
        subject: `${actionUser.name} commented the card ${actionCard.name} on ${actionBoard.name}`,
        html:
          `<p>${actionUser.name} commented the card ` +
          `<a href="${process.env.BASE_URL}/cards/${actionCard.id}">${actionCard.name}</a> ` +
          `on <a href="${process.env.BASE_URL}/boards/${actionBoard.id}">${actionBoard.name}</a></p>` +
          `<p>${action.data.text}</p>`,
      };
      break;

    default:
      break;
  }
  if (!email) {
    return;
  }
  emailTransporter.sendMail(
    { from: process.env.SMTP_FROM, to: notificationUser.email, ...email },
    (error, info) => {
      if (error) {
        sails.log.error(error);
      } else {
        sails.log.info('Email sent: %s', info.messageId);
      }
    },
  );
}

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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

    if (emailTransporter) {
      sendEmailNotification({ notification, action: values.action });
    }

    sails.sockets.broadcast(`user:${notification.userId}`, 'notificationCreate', {
      item: notification,
    });

    return notification;
  },
};
