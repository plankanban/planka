/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => BaseCustomFieldGroup.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => BaseCustomFieldGroup.create({ ...values }).fetch();

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

  return BaseCustomFieldGroup.findOne(criteria);
};

const updateOne = (criteria, values) => BaseCustomFieldGroup.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => BaseCustomFieldGroup.destroy(criteria).fetch();

const deleteOne = (criteria) => BaseCustomFieldGroup.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByProjectId,
  getByProjectIds,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
