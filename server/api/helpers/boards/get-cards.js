const LIMIT = 10;

module.exports = {
  inputs: {
    recordOrIdOrIds: {
      type: 'ref',
      custom: (value) => _.isObjectLike(value) || _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    beforeId: {
      type: 'string',
    },
  },

  async fn(inputs) {
    const criteria = {};

    let sort;
    let limit;

    if (_.isObjectLike(inputs.recordOrIdOrIds)) {
      criteria.boardId = inputs.recordOrIdOrIds.id;

      if (inputs.recordOrIdOrIds.type === Board.Types.KANBAN) {
        sort = 'position';
      } else if (inputs.recordOrIdOrIds.type === Board.Types.COLLECTION) {
        if (inputs.beforeId) {
          criteria.id = {
            '<': inputs.beforeId,
          };
        }

        limit = LIMIT;
      }
    } else {
      criteria.boardId = inputs.recordOrIdOrIds;
    }

    return sails.helpers.cards.getMany(criteria, sort, limit);
  },
};
