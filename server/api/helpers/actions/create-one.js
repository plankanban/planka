/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const escapeMarkdown = require('escape-markdown');
const escapeHtml = require('escape-html');

const buildTitle = (action, t) => {
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      return t('Card Created');
    case Action.Types.MOVE_CARD:
      return t('Card Moved');
    default:
      return null;
  }
};

const buildBodyByFormat = (board, card, action, actorUser, t) => {
  const markdownCardLink = `[${escapeMarkdown(card.name)}](${sails.config.custom.baseUrl}/cards/${card.id})`;
  const htmlCardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}">${escapeHtml(card.name)}</a>`;

  switch (action.type) {
    case Action.Types.CREATE_CARD: {
      const listName = sails.helpers.lists.makeName(action.data.list);

      return {
        text: t('%s created %s in %s on %s', actorUser.name, card.name, listName, board.name),
        markdown: t(
          '%s created %s in %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          `**${escapeMarkdown(listName)}**`,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s created %s in %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          `<b>${escapeHtml(listName)}</b>`,
          escapeHtml(board.name),
        ),
      };
    }
    case Action.Types.MOVE_CARD: {
      const fromListName = sails.helpers.lists.makeName(action.data.fromList);
      const toListName = sails.helpers.lists.makeName(action.data.toList);

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
    default:
      return null;
  }
};

const buildAndSendNotifications = async (services, board, card, action, actorUser, t) => {
  await sails.helpers.utils.sendNotifications(
    services,
    buildTitle(action, t),
    buildBodyByFormat(board, card, action, actorUser, t),
  );
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
    webhooks: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const action = await Action.qm.createOne({
      ...values,
      boardId: values.card.boardId,
      cardId: values.card.id,
      userId: values.user.id,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'actionCreate',
      {
        item: action,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      webhooks: inputs.webhooks,
      event: Webhook.Events.ACTION_CREATE,
      buildData: () => ({
        item: action,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: values.user,
    });

    if (Action.INTERNAL_NOTIFIABLE_TYPES.includes(action.type)) {
      if (Action.PERSONAL_NOTIFIABLE_TYPES.includes(action.type)) {
        if (values.user.id !== action.data.user.id) {
          await sails.helpers.notifications.createOne.with({
            values: {
              action,
              userId: action.data.user.id,
              type: action.type,
              data: action.data,
              creatorUser: values.user,
              card: values.card,
            },
            project: inputs.project,
            board: inputs.board,
            list: inputs.list,
            webhooks: inputs.webhooks,
          });
        }
      } else {
        const cardSubscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
          action.cardId,
          action.userId,
        );

        const boardSubscriptionUserIds = await sails.helpers.boards.getSubscriptionUserIds(
          inputs.board.id,
          action.userId,
        );

        const notifiableUserIds = _.union(cardSubscriptionUserIds, boardSubscriptionUserIds);

        await sails.helpers.notifications.createMany.with({
          arrayOfValues: notifiableUserIds.map((userId) => ({
            userId,
            action,
            type: action.type,
            data: action.data,
            creatorUser: values.user,
            card: values.card,
          })),
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
          webhooks: inputs.webhooks,
        });
      }
    }

    if (Action.EXTERNAL_NOTIFIABLE_TYPES.includes(action.type)) {
      const notificationServices = await NotificationService.qm.getByBoardId(inputs.board.id);

      if (notificationServices.length > 0) {
        const services = notificationServices.map((notificationService) =>
          _.pick(notificationService, ['url', 'format']),
        );

        buildAndSendNotifications(
          services,
          inputs.board,
          values.card,
          action,
          values.user,
          sails.helpers.utils.makeTranslator(),
        );
      }
    }

    return action;
  },
};
