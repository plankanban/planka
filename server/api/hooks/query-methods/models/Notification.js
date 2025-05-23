/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const LIMIT = 100;

const defaultFind = (criteria) => Notification.find(criteria).sort('id DESC');

/* Query methods */

const createOne = (values) => {
  if (values.userId) {
    return sails.getDatastore().transaction(async (db) => {
      const notification = await Notification.create({ ...values })
        .fetch()
        .usingConnection(db);

      const query = `
        WITH exceeded_notification AS (
          SELECT id
          FROM notification
          WHERE user_id = $1 AND is_read = FALSE
          ORDER BY id DESC
          OFFSET $2
        )
        UPDATE notification
        SET is_read = TRUE
        WHERE id in (SELECT id FROM exceeded_notification)
      `;

      await sails.sendNativeQuery(query, [values.userId, LIMIT]).usingConnection(db);

      return notification;
    });
  }

  return Notification.create({ ...values }).fetch();
};

const getByIds = (ids) => defaultFind(ids);

const getUnreadByUserId = (userId) =>
  defaultFind({
    userId,
    isRead: false,
  });

const getOneById = (id, { userId } = {}) => {
  const criteria = {
    id,
  };

  if (userId) {
    criteria.userId = userId;
  }

  return Notification.findOne(criteria);
};

const update = (criteria, values) => Notification.update(criteria).set(values).fetch();

const updateOne = (criteria, values) => Notification.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => Notification.destroy(criteria).fetch();

module.exports = {
  createOne,
  getByIds,
  getUnreadByUserId,
  getOneById,
  update,
  updateOne,
  delete: delete_,
};
