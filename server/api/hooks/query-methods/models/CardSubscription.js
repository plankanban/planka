/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => CardSubscription.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => CardSubscription.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId, { exceptUserIdOrIds } = {}) => {
  const criteria = {
    cardId,
  };

  if (exceptUserIdOrIds) {
    criteria.userId = {
      '!=': exceptUserIdOrIds,
    };
  }

  return defaultFind(criteria);
};

const getByCardIdsAndUserId = (cardIds, userId) =>
  defaultFind({
    userId,
    cardId: cardIds,
  });

const getOneByCardIdAndUserId = (cardId, userId) =>
  CardSubscription.findOne({
    cardId,
    userId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CardSubscription.destroy(criteria).fetch();

const deleteOne = (criteria) => CardSubscription.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByCardId,
  getByCardIdsAndUserId,
  getOneByCardIdAndUserId,
  deleteOne,
  delete: delete_,
};
