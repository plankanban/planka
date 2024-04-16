module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
    sortType: {
      type: 'string',
      isIn: ['name_asc', 'duedate_asc', 'createdat_asc', 'createdat_desc'],
      defaultsTo: 'name_asc',
    },
  },

  async fn(inputs) {
    const list = await List.findOne({ id: inputs.record.id });
    if (list) {
      let cards = await Card.find({ listId: inputs.record.id });

      switch (inputs.sortType) {
        case 'name_asc':
          cards.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'duedate_asc':
          cards.sort((a, b) => {
            if (a.dueDate === null) return 1;
            if (b.dueDate === null) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          });
          break;
        case 'createdat_asc':
          cards.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'createdat_desc':
          cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          throw new Error("Invalid sort type specified");
      }

      const positions = cards.map((c) => c.position).sort((a, b) => a - b);

      for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        let nextPosition = positions[i];

        await Card.updateOne({ id: card.id }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
          item: {
            id: card.id,
            position: nextPosition,
          },
        });
      }

      sails.sockets.broadcast(`board:${list.boardId}`, 'listSorted', {
        item: list,
      }, inputs.request);
    }

    return list;
  },
};
