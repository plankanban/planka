/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const LIMIT = 50;

/* Query methods */

const create = (arrayOfValues) => Action.createEach(arrayOfValues).fetch();

const createOne = (values) => Action.create({ ...values }).fetch();

const getByBoardId = (boardId, { beforeId } = {}) => {
  const criteria = {
    boardId,
  };

  if (beforeId) {
    criteria.id = {
      '<': beforeId,
    };
  }

  return Action.find(criteria).sort('id DESC').limit(LIMIT);
};

const getByCardId = (cardId, { beforeId } = {}) => {
  const criteria = {
    cardId,
  };

  if (beforeId) {
    criteria.id = {
      '<': beforeId,
    };
  }

  return Action.find(criteria).sort('id DESC').limit(LIMIT);
};

const update = (criteria, values) => Action.update(criteria).set(values).fetch();

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Action.destroy(criteria).fetch();

module.exports = {
  create,
  createOne,
  getByBoardId,
  getByCardId,
  update,
  delete: delete_,
};
