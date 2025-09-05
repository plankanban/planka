/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { POSITION_GAP } = require('../../../constants');

module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    lists: {
      type: 'ref',
      required: true,
    },
    trelloBoard: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const convertLabelColor = (trelloLabelColor) =>
      Label.COLORS.find((color) => color.includes(trelloLabelColor)) || 'desert-sand';

    const labelIdByTrelloLabelId = {};
    await Promise.all(
      inputs.trelloBoard.labels.map(async (trelloLabel, index) => {
        const { id } = await Label.qm.createOne({
          boardId: inputs.board.id,
          position: POSITION_GAP * (index + 1),
          name: trelloLabel.name || null,
          color: convertLabelColor(trelloLabel.color),
        });

        labelIdByTrelloLabelId[trelloLabel.id] = id;
      }),
    );

    const openedTrelloLists = inputs.trelloBoard.lists.filter((list) => !list.closed);

    const listIdByTrelloListId = {};
    await Promise.all(
      openedTrelloLists.map(async (trelloList) => {
        const { id } = await List.qm.createOne({
          boardId: inputs.board.id,
          type: List.Types.ACTIVE,
          position: trelloList.pos,
          name: trelloList.name,
        });

        listIdByTrelloListId[trelloList.id] = id;
      }),
    );

    const { id: archiveListId } = inputs.lists.find((list) => list.type === List.Types.ARCHIVE);

    const cardIdByTrelloCardId = {};
    await Promise.all(
      inputs.trelloBoard.cards.map(async (trelloCard) => {
        const values = {
          boardId: inputs.board.id,
          type: Card.Types.PROJECT,
          position: trelloCard.pos,
          name: trelloCard.name,
          description: trelloCard.desc || null,
          dueDate: trelloCard.due,
          isDueCompleted: trelloCard.due && trelloCard.dueComplete,
          listChangedAt: new Date().toISOString(),
        };

        const listId = listIdByTrelloListId[trelloCard.idList];

        if (trelloCard.closed) {
          Object.assign(values, {
            listId: archiveListId,
            prevListId: listId,
          });
        } else {
          values.listId = listId || archiveListId;
        }

        const { id } = await Card.qm.createOne(values);
        cardIdByTrelloCardId[trelloCard.id] = id;

        return Promise.all(
          trelloCard.idLabels.map(async (trelloLabelId) =>
            CardLabel.qm.createOne({
              cardId: id,
              labelId: labelIdByTrelloLabelId[trelloLabelId],
            }),
          ),
        );
      }),
    );

    await Promise.all(
      inputs.trelloBoard.checklists.map(async (trelloChecklist) => {
        const { id } = await TaskList.qm.createOne({
          cardId: cardIdByTrelloCardId[trelloChecklist.idCard],
          position: trelloChecklist.pos,
          name: trelloChecklist.name,
        });

        return Promise.all(
          trelloChecklist.checkItems.map(async (trelloCheckItem) =>
            Task.qm.createOne({
              taskListId: id,
              position: trelloCheckItem.pos,
              name: trelloCheckItem.name,
              isCompleted: trelloCheckItem.state === 'complete',
            }),
          ),
        );
      }),
    );

    const trelloCommentActions = inputs.trelloBoard.actions
      .filter((action) => action.type === 'commentCard')
      .reverse();

    await Promise.all(
      trelloCommentActions.map(async (trelloAction) =>
        Comment.qm.createOne({
          cardId: cardIdByTrelloCardId[trelloAction.data.card.id],
          text: `${trelloAction.data.text}\n\n---\n*Note: imported comment, originally posted by\n${trelloAction.memberCreator.fullName} (${trelloAction.memberCreator.username}) on ${trelloAction.date}*`,
        }),
      ),
    );
  },
};
