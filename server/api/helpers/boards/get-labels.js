const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptLabelIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const criteria = {
      boardId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptLabelIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptLabelIdOrIds,
      };
    }

    return sails.helpers.labels.getMany(criteria);
  },
};
