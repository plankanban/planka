/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* Query methods */

const createOne = (values) => Session.create({ ...values }).fetch();

const getOneUndeletedByAccessToken = (accessToken) =>
  Session.findOne({
    accessToken,
    deletedAt: null,
  });

const getOneUndeletedByPendingToken = (pendingToken) =>
  Session.findOne({
    pendingToken,
    deletedAt: null,
  });

const updateOne = (criteria, values) => Session.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Session.destroy(criteria).fetch();

const deleteOneById = (id) =>
  Session.updateOne({
    id,
    deletedAt: null,
  }).set({
    deletedAt: new Date().toISOString(),
  });

module.exports = {
  createOne,
  getOneUndeletedByAccessToken,
  getOneUndeletedByPendingToken,
  updateOne,
  deleteOneById,
  delete: delete_,
};
