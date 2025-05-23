/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const LIMIT = 50;

const defaultFind = (criteria, { limit } = {}) =>
  Comment.find(criteria).sort('id DESC').limit(limit);

/* Query methods */

const createOne = (values) =>
  sails.getDatastore().transaction(async (db) => {
    const comment = await Comment.create({ ...values })
      .fetch()
      .usingConnection(db);

    const queryResult = await sails
      .sendNativeQuery(
        'UPDATE card SET comments_total = comments_total + 1, updated_at = $1 WHERE id = $2',
        [new Date().toISOString(), comment.cardId],
      )
      .usingConnection(db);

    if (queryResult.rowCount === 0) {
      throw 'cardNotFound';
    }

    return comment;
  });

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId, { beforeId } = {}) => {
  const criteria = {
    cardId,
  };

  if (beforeId) {
    criteria.id = {
      '<': beforeId,
    };
  }

  return defaultFind(criteria, { limit: LIMIT });
};

const getOneById = (id) => Comment.findOne(id);

const update = (criteria, values) => Comment.update(criteria).set(values).fetch();

const updateOne = (criteria, values) => Comment.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const comments = await Comment.destroy(criteria).fetch().usingConnection(db);

    if (comments.length > 0) {
      const commentsByCardId = _.groupBy(comments, 'cardId');

      const cardIdsByTotal = Object.entries(commentsByCardId).reduce(
        (result, [cardId, commentsItem]) => ({
          ...result,
          [commentsItem.length]: [...(result[commentsItem.length] || []), cardId],
        }),
        {},
      );

      const queryValues = [];
      let query = 'UPDATE card SET comments_total = comments_total - CASE ';

      Object.entries(cardIdsByTotal).forEach(([total, cardIds]) => {
        const inValues = cardIds.map((cardId) => {
          queryValues.push(cardId);
          return `$${queryValues.length}`;
        });

        queryValues.push(total);
        query += `WHEN id IN (${inValues.join(', ')}) THEN $${queryValues.length}::int `;
      });

      const inValues = Object.keys(commentsByCardId).map((cardId) => {
        queryValues.push(cardId);
        return `$${queryValues.length}`;
      });

      queryValues.push(new Date().toISOString());
      query += `END, updated_at = $${queryValues.length} WHERE id IN (${inValues.join(', ')})`;

      await sails.sendNativeQuery(query, queryValues).usingConnection(db);
    }

    return comments;
  });

const deleteOne = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const comment = await Comment.destroyOne(criteria).usingConnection(db);

    const queryResult = await sails
      .sendNativeQuery(
        'UPDATE card SET comments_total = comments_total - 1, updated_at = $1 WHERE id = $2',
        [new Date().toISOString(), comment.cardId],
      )
      .usingConnection(db);

    if (queryResult.rowCount === 0) {
      throw 'cardNotFound';
    }

    return comment;
  });

module.exports = {
  createOne,
  getByIds,
  getByCardId,
  getOneById,
  update,
  updateOne,
  deleteOne,
  delete: delete_,
};
