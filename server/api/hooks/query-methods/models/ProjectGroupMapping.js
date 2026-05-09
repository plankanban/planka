/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => ProjectGroupMapping.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => ProjectGroupMapping.create({ ...values }).fetch();

const getAll = () => defaultFind({});

const getByIds = (ids) => defaultFind(ids);

const getOneById = (id) => ProjectGroupMapping.findOne({ id });

const getByGroupNames = (groupNames) =>
  defaultFind({
    groupName: groupNames,
  });

const getByProjectId = (projectId) =>
  defaultFind({
    projectId,
  });

const getOneByGroupNameAndProjectId = (groupName, projectId) =>
  ProjectGroupMapping.findOne({
    groupName,
    projectId,
  });

const deleteOne = (criteria) => ProjectGroupMapping.destroyOne(criteria);

module.exports = {
  createOne,
  getAll,
  getByIds,
  getOneById,
  getByGroupNames,
  getByProjectId,
  getOneByGroupNameAndProjectId,
  deleteOne,
};
