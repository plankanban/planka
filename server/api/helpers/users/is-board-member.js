module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    boardId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const boardMembership = await BoardMembership.findOne({
      boardId: inputs.boardId,
      userId: inputs.id,
    });

    return !!boardMembership;
  },
};
