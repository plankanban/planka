const LIMIT = 50;

const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    beforeId: {
      type: 'string',
    },
    withDetails: {
      type: 'boolean',
      defaultsTo: false,
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

    if (!inputs.withDetails) {
      criteria.type = Action.Types.COMMENT_CARD;
    }

    return sails.helpers.actions.getMany(criteria, LIMIT);
  },
};
