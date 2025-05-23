/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => ProjectFavorite.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => ProjectFavorite.create({ ...values }).fetch();

const getByProjectIdsAndUserId = (projectIds, userId) =>
  defaultFind({
    userId,
    projectId: projectIds,
  });

const getOneByProjectIdAndUserId = (projectId, userId) =>
  ProjectFavorite.findOne({
    projectId,
    userId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => ProjectFavorite.destroy(criteria).fetch();

const deleteOne = (criteria) => ProjectFavorite.destroyOne(criteria);

module.exports = {
  createOne,
  getByProjectIdsAndUserId,
  getOneByProjectIdAndUserId,
  deleteOne,
  delete: delete_,
};
