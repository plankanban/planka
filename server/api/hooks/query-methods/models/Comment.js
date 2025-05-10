/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const LIMIT = 50;

const defaultFind = (criteria, { limit } = {}) =>
  Comment.find(criteria).sort('id DESC').limit(limit);

/* Query methods */

const createOne = (values) => Comment.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId, { beforeId } = {}) => {
  const criteria = {
    cardId,
  };

  if (beforeId) {
    criteria.id = {
      '<': beforeId,
    };
  }

  return defaultFind(criteria, { limit: LIMIT });
};

const getOneById = (id) => Comment.findOne(id);

const update = (criteria, values) => Comment.update(criteria).set(values).fetch();

const updateOne = (criteria, values) => Comment.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Comment.destroy(criteria).fetch();

const deleteOne = (criteria) => Comment.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByCardId,
  getOneById,
  update,
  updateOne,
  deleteOne,
  delete: delete_,
};
