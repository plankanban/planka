/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const escapeMarkdown = require('escape-markdown');
const escapeHtml = require('escape-html');

const { formatTextWithMentions } = require('../../../utils/formatters');

const extractMentionedUserIds = (text) => {
  const mentionRegex = /@\[.*?\]\((.*?)\)/g;
  const matches = [...text.matchAll(mentionRegex)];
  return matches.map((match) => match[1]);
};

const buildAndSendNotifications = async (services, board, card, comment, actorUser, t) => {
  const markdownCardLink = `[${escapeMarkdown(card.name)}](${sails.config.custom.baseUrl}/cards/${card.id})`;
  const htmlCardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}}">${escapeHtml(card.name)}</a>`;
  const commentText = _.truncate(formatTextWithMentions(comment.text));

  await sails.helpers.utils.sendNotifications(services, t('New Comment'), {
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
  });
};

module.exports = {
  inputs: {
    values: {
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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const comment = await Comment.qm.createOne({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'commentCreate',
      {
        item: comment,
        included: {
          users: [sails.helpers.users.presentOne(values.user, {})],
        },
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'commentCreate',
      buildData: () => ({
        item: comment,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: values.user,
    });

    let mentionedUserIds = extractMentionedUserIds(values.text);

    if (mentionedUserIds.length > 0) {
      const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(inputs.board.id);

      mentionedUserIds = _.difference(
        _.intersection(mentionedUserIds, boardMemberUserIds),
        comment.userId,
      );
    }

    const mentionedUserIdsSet = new Set(mentionedUserIds);

    const cardSubscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
      comment.cardId,
      comment.userId,
    );

    const boardSubscriptionUserIds = await sails.helpers.boards.getSubscriptionUserIds(
      inputs.board.id,
      comment.userId,
    );

    const notifiableUserIds = _.union(
      mentionedUserIds,
      cardSubscriptionUserIds,
      boardSubscriptionUserIds,
    );

    await Promise.all(
      notifiableUserIds.map((userId) =>
        sails.helpers.notifications.createOne.with({
          values: {
            userId,
            comment,
            type: mentionedUserIdsSet.has(userId)
              ? Notification.Types.MENTION_IN_COMMENT
              : Notification.Types.COMMENT_CARD,
            data: {
              card: _.pick(values.card, ['name']),
              text: comment.text,
            },
            creatorUser: values.user,
            card: values.card,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
        }),
      ),
    );

    if (values.user.subscribeToCardWhenCommenting) {
      let cardSubscription;
      try {
        cardSubscription = await CardSubscription.qm.createOne({
          cardId: comment.cardId,
          userId: comment.userId,
        });
      } catch (error) {
        if (error.code !== 'E_UNIQUE') {
          throw error;
        }
      }

      if (cardSubscription) {
        sails.sockets.broadcast(`user:${comment.userId}`, 'cardUpdate', {
          item: {
            id: comment.cardId,
            isSubscribed: true,
          },
        });

        // TODO: send webhooks
      }
    }

    const notificationServices = await NotificationService.qm.getByBoardId(inputs.board.id);

    if (notificationServices.length > 0) {
      const services = notificationServices.map((notificationService) =>
        _.pick(notificationService, ['url', 'format']),
      );

      buildAndSendNotifications(
        services,
        inputs.board,
        values.card,
        comment,
        values.user,
        sails.helpers.utils.makeTranslator(),
      );
    }

    return comment;
  },
};
