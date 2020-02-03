module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value),
      required: true,
    },
    exceptListId: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value),
    },
  },

  async fn(inputs, exits) {
    const criteria = {
      boardId: inputs.id,
    };

    if (!_.isUndefined(inputs.exceptListId)) {
      criteria.id = {
        '!=': inputs.exceptListId,
      };
    }

    const lists = await List.find(criteria).sort('position');

    return exits.success(lists);
  },
};
