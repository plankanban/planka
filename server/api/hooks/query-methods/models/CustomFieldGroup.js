/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { exceptIdOrIds, sort = 'id' } = {}) => {
  if (exceptIdOrIds) {
    // eslint-disable-next-line no-param-reassign
    criteria.id = {
      '!=': exceptIdOrIds,
    };
  }

  return CustomFieldGroup.find(criteria).sort(sort);
};

/* Query methods */

const create = (arrayOfValues) => CustomFieldGroup.createEach(arrayOfValues).fetch();

const createOne = (values) => CustomFieldGroup.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByBoardId = (boardId, { exceptIdOrIds, sort = ['position', 'id'] } = {}) =>
  defaultFind(
    {
      boardId,
    },
    { exceptIdOrIds, sort },
  );

const getByCardId = (cardId, { exceptIdOrIds, sort = ['position', 'id'] } = {}) =>
  defaultFind(
    {
      cardId,
    },
    { exceptIdOrIds, sort },
  );

const getByCardIds = (cardIds, { sort = ['position', 'id'] } = {}) =>
  defaultFind(
    {
      cardId: cardIds,
    },
    { sort },
  );

const getOneById = (id) => CustomFieldGroup.findOne(id);

const update = (criteria, values) => CustomFieldGroup.update(criteria).set(values).fetch();

const updateOne = (criteria, values) => CustomFieldGroup.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CustomFieldGroup.destroy(criteria).fetch();

const deleteOne = (criteria) => CustomFieldGroup.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByBoardId,
  getByIds,
  getByCardId,
  getByCardIds,
  getOneById,
  update,
  updateOne,
  deleteOne,
  delete: delete_,
};
