module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
    exceptBoardId: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
    },
  },

  async fn(inputs, exits) {
    const criteria = {
      projectId: inputs.id,
    };

    if (!_.isUndefined(inputs.exceptBoardId)) {
      criteria.id = {
        '!=': inputs.exceptBoardId,
      };
    }

    const boards = await sails.helpers.getBoards(criteria);

    return exits.success(boards);
  },
};
