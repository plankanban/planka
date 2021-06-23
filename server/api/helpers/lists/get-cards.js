module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    exceptCardIdOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
    },
  },

  async fn(inputs) {
    const criteria = {
      listId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptCardIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptCardIdOrIds,
      };
    }

    return sails.helpers.cards.getMany(criteria);
  },
};
