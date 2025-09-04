/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { makeWhereQueryBuilder } = require('../helpers');

const hasAvatarChanged = (avatar, prevAvatar) => {
  if (!avatar && !prevAvatar) {
    return false;
  }

  if (!avatar || !prevAvatar) {
    return true;
  }

  return avatar.uploadedFileId !== prevAvatar.uploadedFileId;
};

const buildWhereQuery = makeWhereQueryBuilder(User);

const defaultFind = (criteria) => User.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => {
  if (sails.config.custom.activeUsersLimit !== null) {
    return sails.getDatastore().transaction(async (db) => {
      const queryResult = await sails
        .sendNativeQuery('SELECT NULL FROM user_account WHERE is_deactivated = $1 FOR UPDATE', [
          false,
        ])
        .usingConnection(db);

      if (queryResult.rowCount >= sails.config.custom.activeUsersLimit) {
        throw 'activeLimitReached';
      }

      return User.create({ ...values })
        .fetch()
        .usingConnection(db);
    });
  }

  return User.create({ ...values }).fetch();
};

const getByIds = (ids) => defaultFind(ids);

const getAll = ({ roleOrRoles } = {}) =>
  defaultFind({
    role: roleOrRoles,
  });

const getOneById = (id, { withDeactivated = true } = {}) => {
  const criteria = {
    id,
  };

  if (!withDeactivated) {
    criteria.isDeactivated = false;
  }

  return User.findOne(criteria);
};

const getOneByEmail = (email) =>
  User.findOne({
    email: email.toLowerCase(),
  });

const getOneActiveByEmailOrUsername = (emailOrUsername) => {
  const fieldName = emailOrUsername.includes('@') ? 'email' : 'username';

  return User.findOne({
    [fieldName]: emailOrUsername.toLowerCase(),
    isDeactivated: false,
  });
};

const updateOne = async (criteria, values) => {
  const enforceActiveLimit =
    values.isDeactivated === false && sails.config.custom.activeUsersLimit !== null;

  if (!_.isUndefined(values.avatar) || enforceActiveLimit) {
    return sails.getDatastore().transaction(async (db) => {
      if (enforceActiveLimit) {
        const queryResult = await sails
          .sendNativeQuery('SELECT NULL FROM user_account WHERE is_deactivated = $1 FOR UPDATE', [
            false,
          ])
          .usingConnection(db);

        if (queryResult.rowCount >= sails.config.custom.activeUsersLimit) {
          throw 'activeLimitReached';
        }
      }

      let prev;
      if (!_.isUndefined(values.avatar)) {
        const [whereQuery, whereQueryValues] = buildWhereQuery(criteria);

        const queryResult = await sails
          .sendNativeQuery(
            `SELECT avatar FROM user_account WHERE ${whereQuery} LIMIT 1 FOR UPDATE`,
            whereQueryValues,
          )
          .usingConnection(db);

        if (queryResult.rowCount === 0) {
          return { user: null };
        }

        prev = {
          avatar: queryResult.rows[0].avatar,
        };
      }

      const user = await User.updateOne(criteria)
        .set({ ...values })
        .usingConnection(db);

      let uploadedFile;
      if (!_.isUndefined(values.avatar) && hasAvatarChanged(user.avatar, prev.avatar)) {
        if (prev.avatar) {
          const queryResult = await sails
            .sendNativeQuery(
              'UPDATE uploaded_file SET references_total = CASE WHEN references_total > 1 THEN references_total - 1 END, updated_at = $1 WHERE id = $2 RETURNING *',
              [new Date().toISOString(), prev.avatar.uploadedFileId],
            )
            .usingConnection(db);

          const [row] = queryResult.rows;

          uploadedFile = {
            id: row.id,
            type: row.type,
            mimeType: row.mime_type,
            size: row.size,
            referencesTotal: row.references_total,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
        }

        if (user.avatar) {
          const queryResult = await sails
            .sendNativeQuery(
              'UPDATE uploaded_file SET references_total = references_total + 1, updated_at = $1 WHERE id = $2 AND references_total IS NOT NULL',
              [new Date().toISOString(), user.avatar.uploadedFileId],
            )
            .usingConnection(db);

          if (queryResult.rowCount === 0) {
            throw 'uploadedFileNotFound';
          }
        }
      }

      return { user, uploadedFile };
    });
  }

  const user = await User.updateOne(criteria).set({ ...values });
  return { user };
};

const deleteOne = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const user = await User.destroyOne(criteria).usingConnection(db);

    let uploadedFile;
    if (user.avatar) {
      const queryResult = await sails
        .sendNativeQuery(
          'UPDATE uploaded_file SET references_total = CASE WHEN references_total > 1 THEN references_total - 1 END, updated_at = $1 WHERE id = $2 RETURNING *',
          [new Date().toISOString(), user.avatar.uploadedFileId],
        )
        .usingConnection(db);

      const [row] = queryResult.rows;

      uploadedFile = {
        id: row.id,
        type: row.type,
        mimeType: row.mime_type,
        size: row.size,
        referencesTotal: row.references_total,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }

    return { user, uploadedFile };
  });

module.exports = {
  createOne,
  getByIds,
  getAll,
  getOneById,
  getOneByEmail,
  getOneActiveByEmailOrUsername,
  updateOne,
  deleteOne,
};
