/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => BackgroundImage.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => BackgroundImage.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByProjectId = (projectId) =>
  defaultFind({
    projectId,
  });

const getByProjectIds = (projectIds) =>
  defaultFind({
    projectId: projectIds,
  });

const getOneById = (id, { projectId } = {}) => {
  const criteria = {
    id,
  };

  if (projectId) {
    criteria.projectId = projectId;
  }

  return BackgroundImage.findOne(criteria);
};

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => BackgroundImage.destroy(criteria).fetch();

const deleteOne = (criteria) => BackgroundImage.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByProjectId,
  getByProjectIds,
  getOneById,
  deleteOne,
  delete: delete_,
};
