module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    exceptListIdOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
    },
  },

  async fn(inputs) {
    const criteria = {
      boardId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptListIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptListIdOrIds,
      };
    }

    return sails.helpers.lists.getMany(criteria);
  },
};
