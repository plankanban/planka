/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => CardMembership.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => CardMembership.createEach(arrayOfValues).fetch();

const createOne = (values) => CardMembership.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId) =>
  defaultFind({
    cardId,
  });

const getByCardIds = (cardIds) =>
  defaultFind({
    cardId: cardIds,
  });

const getOneByCardIdAndUserId = (cardId, userId) =>
  CardMembership.findOne({
    cardId,
    userId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CardMembership.destroy(criteria).fetch();

const deleteOne = (criteria) => CardMembership.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getOneByCardIdAndUserId,
  deleteOne,
  delete: delete_,
};
