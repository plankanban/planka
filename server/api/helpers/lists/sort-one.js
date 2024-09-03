const List = require('../../models/List');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(List.SortTypes),
      defaultsTo: List.SortTypes.NAME_ASC,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    let cards = await sails.helpers.lists.getCards(inputs.record.id);

    switch (inputs.type) {
      case List.SortTypes.NAME_ASC:
        cards.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case List.SortTypes.DUE_DATE_ASC:
        cards.sort((a, b) => {
          if (a.dueDate === null) return 1;
          if (b.dueDate === null) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      case List.SortTypes.CREATED_AT_ASC:
        cards.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case List.SortTypes.CREATED_AT_DESC:
        cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        throw new Error('Invalid sort type specified');
    }

    const positions = cards.map((c) => c.position).sort((a, b) => a - b);

    cards = await Promise.all(
      cards.map(({ id }, index) =>
        Card.updateOne({
          id,
          listId: inputs.record.id,
        }).set({
          position: positions[index],
        }),
      ),
    );

    sails.sockets.broadcast(
      `board:${inputs.record.boardId}`,
      'listSort',
      {
        item: inputs.record,
        included: {
          cards,
        },
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'listSort',
      data: {
        item: inputs.record,
        included: {
          cards,
          projects: [inputs.project],
          boards: [inputs.board],
        },
      },
      user: inputs.actorUser,
    });

    return cards;
  },
};
