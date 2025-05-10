/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => CardLabel.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => CardLabel.createEach(arrayOfValues).fetch();

const createOne = (values) => CardLabel.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId) =>
  defaultFind({
    cardId,
  });

const getByCardIds = (cardIds) =>
  defaultFind({
    cardId: cardIds,
  });

const getOneByCardIdAndLabelId = (cardId, labelId) =>
  CardLabel.findOne({
    cardId,
    labelId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CardLabel.destroy(criteria).fetch();

const deleteOne = (criteria) => CardLabel.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getOneByCardIdAndLabelId,
  deleteOne,
  delete: delete_,
};
