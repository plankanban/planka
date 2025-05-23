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

  return CustomField.find(criteria).sort(sort);
};

/* Query methods */

const create = (arrayOfValues) => CustomField.createEach(arrayOfValues).fetch();

const createOne = (values) => CustomField.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByBaseCustomFieldGroupId = (
  baseCustomFieldGroupId,
  { exceptIdOrIds, sort = ['position', 'id'] } = {},
) =>
  defaultFind(
    {
      baseCustomFieldGroupId,
    },
    { exceptIdOrIds, sort },
  );

const getByBaseCustomFieldGroupIds = (
  baseCustomFieldGroupIds,
  { sort = ['position', 'id'] } = {},
) =>
  defaultFind(
    {
      baseCustomFieldGroupId: baseCustomFieldGroupIds,
    },
    { sort },
  );

const getByCustomFieldGroupId = async (
  customFieldGroupId,
  { exceptIdOrIds, sort = ['position', 'id'] } = {},
) =>
  defaultFind(
    {
      customFieldGroupId,
    },
    { exceptIdOrIds, sort },
  );

const getByCustomFieldGroupIds = async (customFieldGroupIds, { sort = ['position', 'id'] } = {}) =>
  defaultFind(
    {
      customFieldGroupId: customFieldGroupIds,
    },
    { sort },
  );

const getOneById = (id) => CustomField.findOne(id);

const updateOne = (criteria, values) => CustomField.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CustomField.destroy(criteria).fetch();

const deleteOne = (criteria) => CustomField.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByBaseCustomFieldGroupId,
  getByBaseCustomFieldGroupIds,
  getByCustomFieldGroupId,
  getByCustomFieldGroupIds,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
