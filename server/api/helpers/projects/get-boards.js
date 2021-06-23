module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    exceptBoardIdOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
    },
  },

  async fn(inputs) {
    const criteria = {
      projectId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptBoardIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptBoardIdOrIds,
      };
    }

    return sails.helpers.boards.getMany(criteria);
  },
};
