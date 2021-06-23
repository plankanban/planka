module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    exceptUserIdOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
    },
  },

  async fn(inputs) {
    const criteria = {
      cardId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptUserIdOrIds)) {
      criteria.userId = {
        '!=': inputs.exceptUserIdOrIds,
      };
    }

    return sails.helpers.cardSubscriptions.getMany(criteria);
  },
};
