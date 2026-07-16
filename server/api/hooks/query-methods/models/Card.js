/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const buildSearchParts = require('../../../../utils/build-query-parts');
const { makeRowToModelTransformer } = require('../helpers');

const LIMIT = 50;

const transformRowToModel = makeRowToModelTransformer(Card);

const defaultFind = (criteria, { sort = 'id', limit } = {}) =>
  Card.find(criteria).sort(sort).limit(limit);

/* Query methods */

const createOne = (values) => Card.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByBoardId = (boardId) =>
  defaultFind({
    boardId,
  });

const getByListId = async (listId, { exceptIdOrIds, sort = ['position', 'id'] } = {}) => {
  const criteria = {
    listId,
  };

  if (exceptIdOrIds) {
    criteria.id = {
      '!=': exceptIdOrIds,
    };
  }

  return defaultFind(criteria, { sort });
};

const getByEndlessListId = async (listId, { before, search, userIds, labelIds }) => {
  if (search || userIds || labelIds) {
    if (userIds && userIds.length === 0) {
      return [];
    }

    if (labelIds && labelIds.length === 0) {
      return [];
    }

    const queryValues = [];
    let query = 'SELECT DISTINCT card.* FROM card';

    if (userIds) {
      query += ' LEFT JOIN card_membership ON card.id = card_membership.card_id';
      query += ' LEFT JOIN task_list ON card.id = task_list.card_id';
      query += ' LEFT JOIN task ON task_list.id = task.task_list_id';
    }

    if (labelIds) {
      query += ' LEFT JOIN card_label ON card.id = card_label.card_id';
    }

    queryValues.push(listId);
    query += ` WHERE card.list_id = $${queryValues.length}`;

    if (before) {
      queryValues.push(before.listChangedAt);
      query += ` AND (card.list_changed_at < $${queryValues.length} OR (card.list_changed_at = $${queryValues.length}`;

      queryValues.push(before.id);
      query += ` AND card.id < $${queryValues.length}))`;
    }

    if (search) {
      if (search.startsWith('/')) {
        queryValues.push(search.substring(1));
        query += ` AND (card.name ~* $${queryValues.length} OR card.description ~* $${queryValues.length})`;
      } else {
        const searchParts = buildSearchParts(search);

        if (searchParts.length > 0) {
          const ilikeValues = searchParts.map((searchPart) => {
            queryValues.push(searchPart);
            return `'%' || $${queryValues.length} || '%'`;
          });

          query += ` AND ((card.name ILIKE ALL(ARRAY[${ilikeValues.join(', ')}])) OR (card.description ILIKE ALL(ARRAY[${ilikeValues.join(', ')}])))`;
        }
      }
    }

    if (userIds) {
      const inValues = userIds.map((userId) => {
        queryValues.push(userId);
        return `$${queryValues.length}`;
      });

      query += ` AND (card_membership.user_id IN (${inValues.join(', ')}) OR task.assignee_user_id IN (${inValues.join(', ')}))`;
    }

    if (labelIds) {
      const inValues = labelIds.map((labelId) => {
        queryValues.push(labelId);
        return `$${queryValues.length}`;
      });

      query += ` AND card_label.label_id IN (${inValues.join(', ')})`;
    }

    query += ` LIMIT ${LIMIT}`;

    let queryResult;
    try {
      queryResult = await sails.sendNativeQuery(query, queryValues);
    } catch (error) {
      if (
        error.code === 'E_QUERY_FAILED' &&
        error.message.includes('Query failed: invalid regular expression')
      ) {
        return [];
      }

      throw error;
    }

    return queryResult.rows.map((row) => transformRowToModel(row));
  }

  const criteria = {
    and: [{ listId }],
  };

  if (before) {
    criteria.and.push({
      or: [
        {
          listChangedAt: {
            '<': before.listChangedAt,
          },
        },
        {
          listChangedAt: before.listChangedAt,
          id: {
            '<': before.id,
          },
        },
      ],
    });
  }

  return defaultFind(criteria, {
    sort: ['listChangedAt DESC', 'id DESC'],
    limit: LIMIT,
  });
};

const getByListIds = async (listIds, { sort = ['position', 'id'] } = {}) =>
  defaultFind(
    {
      listId: listIds,
    },
    { sort },
  );

const getOneById = (id, { listId } = {}) => {
  const criteria = {
    id,
  };

  if (listId) {
    criteria.listId = listId;
  }

  return Card.findOne(criteria);
};

const update = async (criteria, values) => {
  if (!_.isUndefined(values.isClosed)) {
    return sails.getDatastore().transaction(async (db) => {
      const cards = await Card.update(criteria).set(values).fetch().usingConnection(db);

      let tasks = [];
      if (!_.isUndefined(values.isClosed)) {
        tasks = await Task.update({
          linkedCardId: sails.helpers.utils.mapRecords(cards),
        })
          .set({
            isCompleted: values.isClosed,
          })
          .fetch()
          .usingConnection(db);
      }

      return { cards, tasks };
    });
  }

  const cards = await Card.update(criteria).set(values).fetch();
  return { cards };
};

const updateOne = async (criteria, values) => {
  if (!_.isUndefined(values.isClosed)) {
    return sails.getDatastore().transaction(async (db) => {
      const card = await Card.updateOne(criteria)
        .set({ ...values })
        .usingConnection(db);

      let tasks;
      if (!_.isUndefined(values.isClosed) && card) {
        tasks = await Task.update({
          linkedCardId: card.id,
        })
          .set({
            isCompleted: card.isClosed,
          })
          .fetch()
          .usingConnection(db);
      }

      return { card, tasks };
    });
  }

  const card = await Card.updateOne(criteria).set({ ...values });
  return { card };
};

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Card.destroy(criteria).fetch();

const deleteOne = (criteria) => Card.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByBoardId,
  getByListId,
  getByEndlessListId,
  getByListIds,
  getOneById,
  update,
  updateOne,
  deleteOne,
  delete: delete_,
};
