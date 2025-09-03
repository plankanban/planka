/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { sort = 'id' } = {}) => List.find(criteria).sort(sort);

/* Query methods */

const createOne = (values) => List.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByBoardId = (boardId, { exceptIdOrIds, typeOrTypes, sort = ['position', 'id'] } = {}) => {
  const criteria = {
    boardId,
  };

  if (exceptIdOrIds) {
    criteria.id = {
      '!=': exceptIdOrIds,
    };
  }

  if (typeOrTypes) {
    criteria.type = typeOrTypes;
  }

  return defaultFind(criteria, { sort });
};

const getOneById = (id, { boardId } = {}) => {
  const criteria = {
    id,
  };

  if (boardId) {
    criteria.boardId = boardId;
  }

  return List.findOne(criteria);
};

const getOneTrashByBoardId = (boardId) =>
  List.findOne({
    boardId,
    type: List.Types.TRASH,
  });

const updateOne = (criteria, values) => {
  if (values.boardId) {
    return sails.getDatastore().transaction(async (db) => {
      const list = await List.updateOne(criteria)
        .set({ ...values })
        .usingConnection(db);

      if (list) {
        await Card.update(
          {
            listId: list.id,
          },
          {
            boardId: list.boardId,
          },
        ).usingConnection(db);
      }

      return list;
    });
  }

  return List.updateOne(criteria).set({ ...values });
};

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => List.destroy(criteria).fetch();

const deleteOne = (criteria) => List.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByBoardId,
  getOneById,
  getOneTrashByBoardId,
  updateOne,
  deleteOne,
  delete: delete_,
};
