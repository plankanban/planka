/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => Project.find(criteria).sort('id');

/* Query methods */

const createOne = (values, { user } = {}) =>
  sails.getDatastore().transaction(async (db) => {
    let project = await Project.create({ ...values })
      .fetch()
      .usingConnection(db);

    const projectManager = await ProjectManager.create({
      projectId: project.id,
      userId: user.id,
    })
      .fetch()
      .usingConnection(db);

    if (values.type === Project.Types.PRIVATE) {
      project = await Project.updateOne(project.id)
        .set({
          ownerProjectManagerId: projectManager.id,
        })
        .usingConnection(db);
    }

    return { project, projectManager };
  });

const getByIds = (ids) => defaultFind(ids);

const getShared = ({ exceptIdOrIds } = {}) => {
  const criteria = {
    ownerProjectManagerId: null,
  };

  if (exceptIdOrIds) {
    criteria.id = {
      '!=': exceptIdOrIds,
    };
  }

  return defaultFind(criteria);
};

const getOneById = (id) => Project.findOne(id);

const updateOne = (criteria, values) => Project.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Project.destroy(criteria).fetch();

const deleteOne = (criteria) => Project.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getShared,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
