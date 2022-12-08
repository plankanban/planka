const fs = require('fs');

async function importFromTrello(inputs) {
  let trelloBoard;

  const getTrelloLists = () => trelloBoard.lists.filter((list) => !list.closed);
  const getTrelloCardsOfList = (listId) =>
    trelloBoard.cards.filter((l) => l.idList === listId && !l.closed);
  const getAllTrelloCheckItemsOfCard = (cardId) =>
    trelloBoard.checklists
      .filter((c) => c.idCard === cardId)
      .map((checklist) => checklist.checkItems)
      .flat();
  const getTrelloCommentsOfCard = (cardId) =>
    trelloBoard.actions.filter(
      (action) =>
        action.type === 'commentCard' &&
        action.data &&
        action.data.card &&
        action.data.card.id === cardId,
    );

  const loadTrelloFile = async () =>
    new Promise((resolve, reject) => {
      fs.readFile(inputs.file.fd, (err, data) => {
        const exp = data && JSON.parse(data);
        if (err) {
          reject(err);
          return;
        }
        trelloBoard = exp;
        resolve(exp);
      });
    });

  const importComments = async (trelloCard, plankaCard) => {
    const trelloComments = getTrelloCommentsOfCard(trelloCard.id);
    trelloComments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return Promise.all(
      trelloComments.map(async (trelloComment) => {
        return sails.helpers.actions.createOne(
          {
            type: 'commentCard',
            data: {
              text:
                `${trelloComment.data.text}\n\n---\n*Note: imported comment, originally posted by ` +
                `\n${trelloComment.memberCreator.fullName} (${trelloComment.memberCreator.username}) on ${trelloComment.date}*`,
            },
          },
          inputs.user,
          plankaCard,
          inputs.request,
        );
      }),
    );
  };

  const importTasks = async (trelloCard, plankaCard) => {
    // TODO find workaround for tasks/checklist mismapping, see issue trello2planka#5
    return Promise.all(
      getAllTrelloCheckItemsOfCard(trelloCard.id).map(async (trelloCheckItem) => {
        return sails.helpers.tasks.createOne(
          {
            cardId: plankaCard.id,
            position: trelloCheckItem.pos,
            name: trelloCheckItem.name,
            isCompleted: trelloCheckItem.state === 'complete',
          },
          plankaCard,
          inputs.request,
        );
      }),
    );
  };

  const importCards = async (trelloList, plankaList) => {
    return Promise.all(
      getTrelloCardsOfList(trelloList.id).map(async (trelloCard) => {
        const plankaCard = await sails.helpers.cards.createOne(
          {
            listId: plankaList.id,
            position: trelloCard.pos,
            name: trelloCard.name,
            description: trelloCard.desc || null,
          },
          inputs.user,
          inputs.board,
          plankaList,
          inputs.request,
        );

        await importTasks(trelloCard, plankaCard);
        await importComments(trelloCard, plankaCard);
        return plankaCard;
      }),
    );
  };

  const importLists = async () => {
    return Promise.all(
      getTrelloLists().map(async (trelloList) => {
        const plankaList = await sails.helpers.lists.createOne(
          {
            name: trelloList.name,
            position: trelloList.pos,
          },
          inputs.board,
          inputs.request,
        );
        return importCards(trelloList, plankaList);
      }),
    );
  };

  await loadTrelloFile();
  await importLists();
}

module.exports = {
  inputs: {
    user: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    file: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    // TODO some validations or something? check if the input file is ok?

    await importFromTrello(inputs);

    // TODO handle errors properly

    return {
      board: inputs.board,
    };
  },
};
