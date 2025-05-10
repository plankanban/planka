/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { sort = 'id' } = {}) => TaskList.find(criteria).sort(sort);

/* Query methods */

const create = (arrayOfValues) => TaskList.createEach(arrayOfValues).fetch();

const createOne = (values) => TaskList.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId, { exceptIdOrIds, sort = ['position', 'id'] } = {}) => {
  const criteria = {
    cardId,
  };

  if (exceptIdOrIds) {
    criteria.id = {
      '!=': exceptIdOrIds,
    };
  }

  return defaultFind(criteria, { sort });
};

const getByCardIds = (cardIds, { sort = ['position', 'id'] } = {}) =>
  defaultFind(
    {
      cardId: cardIds,
    },
    { sort },
  );

const getOneById = (id, { cardId } = {}) => {
  const criteria = {
    id,
  };

  if (cardId) {
    criteria.cardId = cardId;
  }

  return TaskList.findOne(criteria);
};

const updateOne = (criteria, values) => TaskList.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => TaskList.destroy(criteria).fetch();

const deleteOne = (criteria) => TaskList.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
