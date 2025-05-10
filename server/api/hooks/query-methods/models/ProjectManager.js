/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => ProjectManager.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => ProjectManager.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByProjectId = (projectId, { exceptIdOrIds } = {}) => {
  const criteria = {
    projectId,
  };

  if (exceptIdOrIds) {
    criteria.id = {
      '!=': exceptIdOrIds,
    };
  }

  return defaultFind(criteria);
};

const getByProjectIds = (projectIds, { exceptUserIdOrIds } = {}) => {
  const criteria = {
    projectId: projectIds,
  };

  if (exceptUserIdOrIds) {
    criteria.userId = {
      '!=': exceptUserIdOrIds,
    };
  }

  return defaultFind(criteria);
};

const getByUserId = (userId) =>
  defaultFind({
    userId,
  });

const getOneById = (id, { projectId } = {}) => {
  const criteria = {
    id,
  };

  if (projectId) {
    criteria.projectId = projectId;
  }

  return ProjectManager.findOne(criteria);
};

const getOneByProjectIdAndUserId = (projectId, userId) =>
  ProjectManager.findOne({
    projectId,
    userId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => ProjectManager.destroy(criteria).fetch();

const deleteOne = (criteria) => ProjectManager.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByProjectId,
  getByProjectIds,
  getByUserId,
  getOneById,
  getOneByProjectIdAndUserId,
  deleteOne,
  delete: delete_,
};
