/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const escapeMarkdown = require('escape-markdown');
const escapeHtml = require('escape-html');

const { mentionMarkupToText } = require('../../../utils/mentions');

const buildTitle = (notification, t) => {
  switch (notification.type) {
    case Notification.Types.MOVE_CARD:
      return t('Card Moved');
    case Notification.Types.COMMENT_CARD:
      return t('New Comment');
    case Notification.Types.ADD_MEMBER_TO_CARD:
      return t('You Were Added to Card');
    case Notification.Types.MENTION_IN_COMMENT:
      return t('You Were Mentioned in Comment');
    default:
      return null;
  }
};

const buildBodyByFormat = (board, card, notification, actorUser, t) => {
  const markdownCardLink = `[${escapeMarkdown(card.name)}](${sails.config.custom.baseUrl}/cards/${card.id})`;
  const htmlCardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}">${escapeHtml(card.name)}</a>`;

  switch (notification.type) {
    case Notification.Types.MOVE_CARD: {
      const fromListName = sails.helpers.lists.makeName(notification.data.fromList);
      const toListName = sails.helpers.lists.makeName(notification.data.toList);

      return {
        text: t(
          '%s moved %s from %s to %s on %s',
          actorUser.name,
          card.name,
          fromListName,
          toListName,
          board.name,
        ),
        markdown: t(
          '%s moved %s from %s to %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          `**${escapeMarkdown(fromListName)}**`,
          `**${escapeMarkdown(toListName)}**`,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s moved %s from %s to %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          `<b>${escapeHtml(fromListName)}</b>`,
          `<b>${escapeHtml(toListName)}</b>`,
          escapeHtml(board.name),
        ),
      };
    }
    case Notification.Types.COMMENT_CARD: {
      const commentText = _.truncate(mentionMarkupToText(notification.data.text));

      return {
        text: `${t(
          '%s left a new comment to %s on %s',
          actorUser.name,
          card.name,
          board.name,
        )}:\n${commentText}`,
        markdown: `${t(
          '%s left a new comment to %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          escapeMarkdown(board.name),
        )}:\n\n*${escapeMarkdown(commentText)}*`,
        html: `${t(
          '%s left a new comment to %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          escapeHtml(board.name),
        )}:\n\n<i>${escapeHtml(commentText)}</i>`,
      };
    }
    case Notification.Types.ADD_MEMBER_TO_CARD:
      return {
        text: t('%s added you to %s on %s', actorUser.name, card.name, board.name),
        markdown: t(
          '%s added you to %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s added you to %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    case Notification.Types.MENTION_IN_COMMENT: {
      const commentText = _.truncate(mentionMarkupToText(notification.data.text));

      return {
        text: `${t(
          '%s mentioned you in %s on %s',
          actorUser.name,
          card.name,
          board.name,
        )}:\n${commentText}`,
        markdown: `${t(
          '%s mentioned you in %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          escapeMarkdown(board.name),
        )}:\n\n*${escapeMarkdown(commentText)}*`,
        html: `${t(
          '%s mentioned you in %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          escapeHtml(board.name),
        )}:\n\n<i>${escapeHtml(commentText)}</i>`,
      };
    }
    default:
      return null;
  }
};

const buildAndSendNotifications = async (services, board, card, notification, actorUser, t) => {
  await sails.helpers.utils.sendNotifications(
    services,
    buildTitle(notification, t),
    buildBodyByFormat(board, card, notification, actorUser, t),
  );
};

// TODO: use templates (views) to build html
const buildEmail = (board, card, notification, actorUser, notifiableUser, t) => {
  const cardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}">${escapeHtml(card.name)}</a>`;
  const boardLink = `<a href="${sails.config.custom.baseUrl}/boards/${board.id}">${escapeHtml(board.name)}</a>`;

  let html;
  switch (notification.type) {
    case Notification.Types.MOVE_CARD: {
      const fromListName = sails.helpers.lists.makeName(notification.data.fromList);
      const toListName = sails.helpers.lists.makeName(notification.data.toList);

      html = `<p>${t(
        '%s moved %s from %s to %s on %s',
        escapeHtml(actorUser.name),
        cardLink,
        escapeHtml(fromListName),
        escapeHtml(toListName),
        boardLink,
      )}</p>`;

      break;
    }
    case Notification.Types.COMMENT_CARD:
      html = `<p>${t(
        '%s left a new comment to %s on %s',
        escapeHtml(actorUser.name),
        cardLink,
        boardLink,
      )}</p><p>${escapeHtml(mentionMarkupToText(notification.data.text))}</p>`;

      break;
    case Notification.Types.ADD_MEMBER_TO_CARD:
      html = `<p>${t(
        '%s added you to %s on %s',
        escapeHtml(actorUser.name),
        cardLink,
        boardLink,
      )}</p>`;

      break;
    case Notification.Types.MENTION_IN_COMMENT:
      html = `<p>${t(
        '%s mentioned you in %s on %s',
        escapeHtml(actorUser.name),
        cardLink,
        boardLink,
      )}</p><p>${escapeHtml(mentionMarkupToText(notification.data.text))}</p>`;

      break;
    default:
      return null; // TODO: throw error?
  }

  return {
    html,
    to: notifiableUser.email,
    subject: buildTitle(notification, t),
  };
};

const sendEmails = async (transporter, emails) => {
  await Promise.all(
    emails.map((email) =>
      sails.helpers.utils.sendEmail.with({
        ...email,
        transporter,
      }),
    ),
  );

  transporter.close();
};

module.exports = {
  inputs: {
    arrayOfValues: {
      type: 'ref',
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
    webhooks: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { arrayOfValues } = inputs;

    const ids = await sails.helpers.utils.generateIds(arrayOfValues.length);
    const valuesById = {};

    const notifications = await Notification.qm.create(
      arrayOfValues.map((values) => {
        const id = ids.shift();

        const isCommentRelated =
          values.type === Notification.Types.COMMENT_CARD ||
          values.type === Notification.Types.MENTION_IN_COMMENT;

        const nextValues = {
          ...values,
          id,
          creatorUserId: values.creatorUser.id,
          boardId: values.card.boardId,
          cardId: values.card.id,
        };

        if (isCommentRelated) {
          nextValues.commentId = values.comment.id;
        } else {
          nextValues.actionId = values.action.id;
        }

        valuesById[id] = { ...nextValues }; // FIXME: hack
        return nextValues;
      }),
    );

    notifications.forEach((notification) => {
      const values = valuesById[notification.id];

      sails.sockets.broadcast(`user:${notification.userId}`, 'notificationCreate', {
        item: notification,
        included: {
          users: [sails.helpers.users.presentOne(values.creatorUser, {})], // FIXME: hack
        },
      });

      sails.helpers.utils.sendWebhooks.with({
        webhooks: inputs.webhooks,
        event: Webhook.Events.NOTIFICATION_CREATE,
        buildData: () => ({
          item: notification,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [values.card],
            ...(notification.commentId
              ? {
                  comments: [values.comment],
                }
              : {
                  actions: [values.action],
                }),
          },
        }),
        user: values.creatorUser,
      });
    });

    const notificationsByUserId = _.groupBy(notifications, 'userId');
    const userIds = Object.keys(notificationsByUserId);

    const notificationServices = await NotificationService.qm.getByUserIds(userIds);
    const { transporter } = await sails.helpers.utils.makeSmtpTransporter();

    if (notificationServices.length > 0 || transporter) {
      const users = await User.qm.getByIds(userIds);
      const userById = _.keyBy(users, 'id');

      const notificationServicesByUserId = _.groupBy(notificationServices, 'userId');

      Object.keys(notificationsByUserId).forEach(async (userId) => {
        const notifiableUser = userById[userId];
        const t = sails.helpers.utils.makeTranslator(notifiableUser.language);

        const emails = notificationsByUserId[userId].flatMap((notification) => {
          const values = valuesById[notification.id];

          if (notificationServicesByUserId[userId]) {
            const services = notificationServicesByUserId[userId].map((notificationService) =>
              _.pick(notificationService, ['url', 'format']),
            );

            buildAndSendNotifications(
              services,
              inputs.board,
              values.card,
              notification,
              values.creatorUser,
              t,
            );
          }

          if (transporter) {
            return buildEmail(
              inputs.board,
              values.card,
              notification,
              values.creatorUser,
              notifiableUser,
              t,
            );
          }

          return [];
        });

        if (emails.length > 0) {
          sendEmails(transporter, emails);
        }
      });
    }

    return notifications;
  },
};
