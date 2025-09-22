/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => NotificationService.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => NotificationService.create({ ...values }).fetch();

const getByUserId = (userId) =>
  defaultFind({
    userId,
  });

const getByUserIds = (userIds) =>
  defaultFind({
    userId: userIds,
  });

const getByBoardId = (boardId) =>
  defaultFind({
    boardId,
  });

const getByBoardIds = (boardIds) =>
  defaultFind({
    boardId: boardIds,
  });

const getOneById = (id) => NotificationService.findOne(id);

const updateOne = (criteria, values) => NotificationService.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => NotificationService.destroy(criteria).fetch();

const deleteOne = (criteria) => NotificationService.destroyOne(criteria);

module.exports = {
  createOne,
  getByUserId,
  getByUserIds,
  getByBoardId,
  getByBoardIds,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
