/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { POSITION_GAP } = require('../../../constants');

const getActorUser = async (card, board) => {
  if (card.creatorUserId) {
    const creatorUser = await User.qm.getOneById(card.creatorUserId);

    if (creatorUser) {
      return creatorUser;
    }
  }

  const boardMemberships = await BoardMembership.qm.getByBoardId(board.id);
  const boardMembership =
    boardMemberships.find(({ role }) => role === BoardMembership.Roles.EDITOR) ||
    boardMemberships[0];

  return boardMembership && User.qm.getOneById(boardMembership.userId);
};

const clearRepeat = async (card) => {
  const { card: nextCard } = await Card.qm.updateOne(card.id, {
    repeatRule: null,
    repeatListId: null,
    repeatNextAt: null,
  });

  if (nextCard) {
    sails.sockets.broadcast(`board:${nextCard.boardId}`, 'cardUpdate', {
      item: {
        id: nextCard.id,
        repeatRule: null,
        repeatListId: null,
        repeatNextAt: null,
      },
    });
  }
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const claimedCard = await Card.qm.claimRepeater(
      inputs.record.id,
      inputs.record.repeatNextAt,
    );

    if (!claimedCard) {
      return null;
    }

    const { card, list, board, project } = await sails.helpers.cards.getPathToProjectById(
      claimedCard.id,
    );

    const repeatRule = claimedCard.repeatRule;
    const nextRepeatAt = sails.helpers.cards.calculateNextRepeatAt(repeatRule, new Date());

    const repeatList = await List.qm.getOneById(claimedCard.repeatListId, {
      boardId: card.boardId,
    });

    if (!repeatList || !sails.helpers.lists.isFinite(repeatList)) {
      await clearRepeat(card);
      return null;
    }

    const actorUser = await getActorUser(card, board);

    if (!actorUser) {
      await Card.qm.updateOne(card.id, {
        repeatNextAt,
      });

      return null;
    }

    const cards = await Card.qm.getByListId(repeatList.id);
    const lastCard = cards[cards.length - 1];

    try {
      await sails.helpers.cards.duplicateOne.with({
        project,
        board,
        list,
        record: card,
        values: {
          list: repeatList,
          position: (lastCard ? lastCard.position : 0) + POSITION_GAP,
          creatorUser: actorUser,
        },
        includeComments: true,
      });
    } catch (error) {
      await Card.qm.updateOne(card.id, {
        repeatNextAt,
      });

      throw error;
    }

    const { card: nextCard } = await Card.qm.updateOne(card.id, {
      repeatNextAt,
    });

    if (nextCard) {
      sails.sockets.broadcast(`board:${nextCard.boardId}`, 'cardUpdate', {
        item: {
          id: nextCard.id,
          repeatNextAt: nextCard.repeatNextAt,
        },
      });
    }

    return nextCard;
  },
};
