/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const createOne = (values) => Session.create({ ...values }).fetch();

const getOneUndeletedByAccessToken = (accessToken) =>
  Session.findOne({
    accessToken,
    deletedAt: null,
  });

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
  deleteOneById,
  delete: delete_,
};
