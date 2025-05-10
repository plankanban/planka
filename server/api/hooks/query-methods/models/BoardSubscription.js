/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => BoardSubscription.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => BoardSubscription.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByBoardId = (boardId, { exceptUserIdOrIds } = {}) => {
  const criteria = {
    boardId,
  };

  if (exceptUserIdOrIds) {
    criteria.userId = {
      '!=': exceptUserIdOrIds,
    };
  }

  return defaultFind(criteria);
};

const getOneByBoardIdAndUserId = (boardId, userId) =>
  BoardSubscription.findOne({
    boardId,
    userId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => BoardSubscription.destroy(criteria).fetch();

const deleteOne = (criteria) => BoardSubscription.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByBoardId,
  getOneByBoardIdAndUserId,
  deleteOne,
  delete: delete_,
};
