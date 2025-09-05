/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { makeWhereQueryBuilder } = require('../helpers');

const buildWhereQuery = makeWhereQueryBuilder(List);

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
  if (values.boardId || values.type) {
    return sails.getDatastore().transaction(async (db) => {
      const [whereQuery, whereQueryValues] = buildWhereQuery(criteria);

      const queryResult = await sails
        .sendNativeQuery(
          `SELECT board_id, type FROM list WHERE ${whereQuery} LIMIT 1 FOR UPDATE`,
          whereQueryValues,
        )
        .usingConnection(db);

      if (queryResult.rowCount === 0) {
        return { list: null };
      }

      const prev = {
        boardId: queryResult.rows[0].board_id,
        type: queryResult.rows[0].type,
      };

      const list = await List.updateOne(criteria)
        .set({ ...values })
        .usingConnection(db);

      let tasks = [];
      if (list) {
        if (list.boardId !== prev.boardId) {
          await Card.update({
            listId: list.id,
          })
            .set({
              boardId: list.boardId,
            })
            .usingConnection(db);
        }

        const prevTypeState = List.TYPE_STATE_BY_TYPE[prev.type];
        const typeState = List.TYPE_STATE_BY_TYPE[list.type];

        const transitions = {
          [`${List.TypeStates.CLOSED}->${List.TypeStates.OPENED}`]: false,
          [`${List.TypeStates.OPENED}->${List.TypeStates.CLOSED}`]: true,
        };

        const isClosed = transitions[`${prevTypeState}->${typeState}`];

        if (!_.isUndefined(isClosed)) {
          const cards = await Card.update({
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

      return { list, tasks };
    });
  }

  const list = await List.updateOne(criteria).set({ ...values });
  return { list };
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
