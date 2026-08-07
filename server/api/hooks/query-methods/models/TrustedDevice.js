/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* Query methods */

const createOne = (values) => TrustedDevice.create({ ...values }).fetch();

const getActiveByUserId = (userId) =>
  TrustedDevice.find({
    userId,
    expiresAt: { '>': new Date().toISOString() },
  }).sort('lastUsedAt DESC');

const updateOne = (criteria, values) => TrustedDevice.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => TrustedDevice.destroy(criteria).fetch();

const deleteByUserId = (userId) => TrustedDevice.destroy({ userId }).fetch();

const deleteOneByUserIdAndId = (userId, id) => TrustedDevice.destroyOne({ userId, id });

module.exports = {
  createOne,
  getActiveByUserId,
  updateOne,
  delete: delete_,
  deleteByUserId,
  deleteOneByUserIdAndId,
};
