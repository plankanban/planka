const LIMIT = 10;

module.exports = {
  inputs: {
    recordOrId: {
      type: 'ref',
      custom: (value) => _.isObjectLike(value) || _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    beforeId: {
      type: 'string',
    },
  },

  async fn(inputs, exits) {
    const criteria = {};

    let sort;
    let limit;

    if (_.isObjectLike(inputs.recordOrId)) {
      criteria.boardId = inputs.recordOrId.id;

      if (inputs.recordOrId.type === 'kanban') {
        sort = 'position';
      } else if (inputs.recordOrId.type === 'collection') {
        if (inputs.beforeId) {
          criteria.id = {
            '<': inputs.beforeId,
          };
        }

        limit = LIMIT;
      }
    } else {
      criteria.boardId = inputs.recordOrId;
    }

    const cards = await sails.helpers.getCards(criteria, sort, limit);

    return exits.success(cards);
  },
};
