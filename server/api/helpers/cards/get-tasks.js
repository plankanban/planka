const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptTaskIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const criteria = {
      cardId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptTaskIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptTaskIdOrIds,
      };
    }

    return sails.helpers.tasks.getMany(criteria);
  },
};
