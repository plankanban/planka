const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptBoardIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
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
