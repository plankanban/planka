const LIMIT = 10;

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    beforeId: {
      type: 'string',
    },
  },

  async fn(inputs) {
    const criteria = {
      cardId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.beforeId)) {
      criteria.id = {
        '<': inputs.beforeId,
      };
    }

    return sails.helpers.actions.getMany(criteria, LIMIT);
  },
};
