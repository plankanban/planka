const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptCardIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
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
