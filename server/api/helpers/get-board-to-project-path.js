module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true
    }
  },

  exits: {
    notFound: {}
  },

  fn: async function(inputs, exits) {
    const board = await Board.findOne(inputs.criteria);

    if (!board) {
      throw 'notFound';
    }

    const project = await Project.findOne(board.projectId);

    if (!project) {
      throw {
        notFound: {
          board
        }
      };
    }

    return exits.success({
      board,
      project
    });
  }
};
