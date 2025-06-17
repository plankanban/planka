/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const LIMIT = 50;

const SEARCH_PARTS_REGEX = /[ ,;]+/;

const defaultFind = (criteria, { sort = 'id', limit } = {}) =>
  Card.find(criteria).sort(sort).limit(limit);

/* Query methods */

const getIdsByEndlessListId = async (
  listId,
  { before, search, filterUserIds, filterLabelIds } = {},
) => {
  if (filterUserIds && filterUserIds.length === 0) {
    return [];
  }

  if (filterLabelIds && filterLabelIds.length === 0) {
    return [];
  }

  const queryValues = [];
  let query = 'SELECT DISTINCT card.id FROM card';

  if (filterUserIds) {
    query += ' LEFT JOIN card_membership ON card.id = card_membership.card_id';
    query += ' LEFT JOIN task_list ON card.id = task_list.card_id';
    query += ' LEFT JOIN task ON task_list.id = task.task_list_id';
  }

  if (filterLabelIds) {
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
      const searchParts = search.split(SEARCH_PARTS_REGEX).flatMap((searchPart) => {
        if (!searchPart) {
          return [];
        }

        return searchPart.toLowerCase();
      });

      if (searchParts.length > 0) {
        let ilikeValues = searchParts.map((searchPart) => {
          queryValues.push(searchPart);
          return `'%' || $${queryValues.length} || '%'`;
        });

        query += ` AND ((card.name ILIKE ALL(ARRAY[${ilikeValues.join(', ')}]))`;

        ilikeValues = searchParts.map((searchPart) => {
          queryValues.push(searchPart);
          return `'%' || $${queryValues.length} || '%'`;
        });

        query += ` OR (card.description ILIKE ALL(ARRAY[${ilikeValues.join(', ')}])))`;
      }
    }
  }

  if (filterUserIds) {
    const inValues = filterUserIds.map((filterUserId) => {
      queryValues.push(filterUserId);
      return `$${queryValues.length}`;
    });

    query += ` AND (card_membership.user_id IN (${inValues.join(', ')}) OR task.assignee_user_id IN (${inValues.join(', ')}))`;
  }

  if (filterLabelIds) {
    const inValues = filterLabelIds.map((filterLabelId) => {
      queryValues.push(filterLabelId);
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

  return sails.helpers.utils.mapRecords(queryResult.rows);
};

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

const getByEndlessListId = async (listId, { before, search, filterUserIds, filterLabelIds }) => {
  const criteria = {};

  const options = {
    sort: ['listChangedAt DESC', 'id DESC'],
  };

  if (search || filterUserIds || filterLabelIds) {
    criteria.id = await getIdsByEndlessListId(listId, {
      before,
      search,
      filterUserIds,
      filterLabelIds,
    });
  } else {
    criteria.and = [{ listId }];

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

    options.limit = LIMIT;
  }

  return defaultFind(criteria, options);
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

const update = (criteria, values) => Card.update(criteria).set(values).fetch();

const updateOne = (criteria, values) => Card.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Card.destroy(criteria).fetch();

const deleteOne = (criteria) => Card.destroyOne(criteria);

module.exports = {
  getIdsByEndlessListId,

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
