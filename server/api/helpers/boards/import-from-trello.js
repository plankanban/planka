const POSITION_GAP = 65535; // TODO: move to config

module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    trelloBoard: {
      type: 'json',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const trelloToPlankaLabels = {};

    const getTrelloLists = () => inputs.trelloBoard.lists.filter((list) => !list.closed);

    const getUsedTrelloLabels = () => {
      const result = {};
      inputs.trelloBoard.cards
        .map((card) => card.labels)
        .flat()
        .forEach((label) => {
          result[label.id] = label;
        });

      return Object.values(result);
    };

    const getTrelloCardsOfList = (listId) =>
      inputs.trelloBoard.cards.filter((card) => card.idList === listId && !card.closed);

    const getAllTrelloCheckItemsOfCard = (cardId) =>
      inputs.trelloBoard.checklists
        .filter((checklist) => checklist.idCard === cardId)
        .map((checklist) => checklist.checkItems)
        .flat();

    const getTrelloCommentsOfCard = (cardId) =>
      inputs.trelloBoard.actions.filter(
        (action) =>
          action.type === 'commentCard' &&
          action.data &&
          action.data.card &&
          action.data.card.id === cardId,
      );

    const getPlankaLabelColor = (trelloLabelColor) =>
      Label.COLORS.find((color) => color.indexOf(trelloLabelColor) !== -1) || 'desert-sand';

    const importCardLabels = async (plankaCard, trelloCard) => {
      return Promise.all(
        trelloCard.labels.map(async (trelloLabel) => {
          return CardLabel.create({
            cardId: plankaCard.id,
            labelId: trelloToPlankaLabels[trelloLabel.id].id,
          });
        }),
      );
    };

    const importTasks = async (plankaCard, trelloCard) => {
      // TODO find workaround for tasks/checklist mismapping, see issue trello2planka#5
      return Promise.all(
        getAllTrelloCheckItemsOfCard(trelloCard.id).map(async (trelloCheckItem) => {
          return Task.create({
            cardId: plankaCard.id,
            position: trelloCheckItem.pos,
            name: trelloCheckItem.name,
            isCompleted: trelloCheckItem.state === 'complete',
          }).fetch();
        }),
      );
    };

    const importComments = async (plankaCard, trelloCard) => {
      const trelloComments = getTrelloCommentsOfCard(trelloCard.id);
      trelloComments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return Promise.all(
        trelloComments.map(async (trelloComment) => {
          return Action.create({
            cardId: plankaCard.id,
            userId: inputs.actorUser.id,
            type: 'commentCard',
            data: {
              text:
                `${trelloComment.data.text}\n\n---\n*Note: imported comment, originally posted by ` +
                `\n${trelloComment.memberCreator.fullName} (${trelloComment.memberCreator.username}) on ${trelloComment.date}*`,
            },
          }).fetch();
        }),
      );
    };

    const importCards = async (plankaList, trelloList) => {
      return Promise.all(
        getTrelloCardsOfList(trelloList.id).map(async (trelloCard) => {
          const plankaCard = await Card.create({
            boardId: inputs.board.id,
            listId: plankaList.id,
            creatorUserId: inputs.actorUser.id,
            position: trelloCard.pos,
            name: trelloCard.name,
            description: trelloCard.desc || null,
            dueDate: trelloCard.due,
          }).fetch();

          await importCardLabels(plankaCard, trelloCard);
          await importTasks(plankaCard, trelloCard);
          await importComments(plankaCard, trelloCard);

          return plankaCard;
        }),
      );
    };

    const importLabels = async () => {
      return Promise.all(
        getUsedTrelloLabels().map(async (trelloLabel, index) => {
          const plankaLabel = await Label.create({
            boardId: inputs.board.id,
            position: POSITION_GAP * (index + 1),
            name: trelloLabel.name || null,
            color: getPlankaLabelColor(trelloLabel.color),
          }).fetch();

          trelloToPlankaLabels[trelloLabel.id] = plankaLabel;
        }),
      );
    };

    const importLists = async () => {
      return Promise.all(
        getTrelloLists().map(async (trelloList) => {
          const plankaList = await List.create({
            boardId: inputs.board.id,
            name: trelloList.name,
            position: trelloList.pos,
          }).fetch();

          return importCards(plankaList, trelloList);
        }),
      );
    };

    await importLabels();
    await importLists();
  },
};
