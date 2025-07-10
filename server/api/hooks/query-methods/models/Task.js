/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { sort = 'id', limit } = {}) =>
  Task.find(criteria).sort(sort).limit(limit);

/* Query methods */

const create = (arrayOfValues) => Task.createEach(arrayOfValues).fetch();

const createOne = (values) => Task.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByTaskListId = async (taskListId, { exceptIdOrIds, sort = ['position', 'id'] } = {}) => {
  const criteria = {
    taskListId,
  };

  if (exceptIdOrIds) {
    criteria.id = {
      '!=': exceptIdOrIds,
    };
  }

  return defaultFind(criteria, { sort });
};

const getByTaskListIds = async (taskListIds, { sort = ['position', 'id'] } = {}) =>
  defaultFind(
    {
      taskListId: taskListIds,
    },
    { sort },
  );

const getByLinkedCardId = (linkedCardId) =>
  defaultFind({
    linkedCardId,
  });

const getOneById = (id, { taskListId } = {}) => {
  const criteria = {
    id,
  };

  if (taskListId) {
    criteria.taskListId = taskListId;
  }

  return Task.findOne(criteria);
};

const update = (criteria, values) => Task.update(criteria).set(values).fetch();

const updateOne = (criteria, values) => Task.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Task.destroy(criteria).fetch();

const deleteOne = (criteria) => Task.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByTaskListId,
  getByTaskListIds,
  getByLinkedCardId,
  getOneById,
  update,
  updateOne,
  deleteOne,
  delete: delete_,
};
