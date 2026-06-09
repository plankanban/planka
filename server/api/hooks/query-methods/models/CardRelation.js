/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => CardRelation.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => CardRelation.create({ ...values }).fetch();

const getOneById = (id) =>
  CardRelation.findOne({
    id,
  });

const getByCardIdOrRelatedCardId = (cardId) =>
  defaultFind({
    or: [
      {
        cardId,
      },
      {
        relatedCardId: cardId,
      },
    ],
  });

const getByCardIdsOrRelatedCardIds = (cardIds) =>
  defaultFind({
    or: [
      {
        cardId: cardIds,
      },
      {
        relatedCardId: cardIds,
      },
    ],
  });

const getOneByCardIdAndRelatedCardId = (cardId, relatedCardId) =>
  CardRelation.findOne({
    cardId,
    relatedCardId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CardRelation.destroy(criteria).fetch();

const deleteOne = (criteria) => CardRelation.destroyOne(criteria);

module.exports = {
  createOne,
  getOneById,
  getByCardIdOrRelatedCardId,
  getByCardIdsOrRelatedCardIds,
  getOneByCardIdAndRelatedCardId,
  deleteOne,
  delete: delete_,
};
