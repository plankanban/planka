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

const updateOne = async (criteria, values) => {
  if (values.type) {
    return sails.getDatastore().transaction(async (db) => {
      const list = await List.updateOne(criteria)
        .set({ ...values })
        .usingConnection(db);

      let cards = [];
      let tasks = [];

      if (list) {
        let isClosed;
        if (list.type === List.Types.ACTIVE) {
          isClosed = false;
        } else if (list.type === List.Types.CLOSED) {
          isClosed = true;
        }

        if (!_.isUndefined(isClosed)) {
          cards = await Card.update({
            listId: list.id,
          })
            .set({
              isClosed,
            })
            .fetch()
            .usingConnection(db);

          if (cards.length > 0) {
            tasks = await Task.update({
              linkedCardId: sails.helpers.utils.mapRecords(cards),
            })
              .set({
                isCompleted: isClosed,
              })
              .fetch()
              .usingConnection(db);
          }
        }
      }

      return {
        list,
        cards,
        tasks,
      };
    });
  }

  const list = await List.updateOne(criteria).set({ ...values });

  return {
    list,
  };
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
