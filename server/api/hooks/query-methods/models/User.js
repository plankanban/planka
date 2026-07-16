/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { makeRowToModelTransformer, makeWhereQueryBuilder } = require('../helpers');

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
const transformRowToModel = makeRowToModelTransformer(User);

const defaultFind = (criteria) => User.find(criteria).sort('id');

/* Query methods */

const createOne = async (values) => {
  const { activeUsersLimit } = await InternalConfig.qm.getOneMain();

  if (activeUsersLimit !== null) {
    return sails.getDatastore().transaction(async (db) => {
      const queryResult = await sails
        .sendNativeQuery('SELECT NULL FROM user_account WHERE is_deactivated = $1 FOR UPDATE', [
          false,
        ])
        .usingConnection(db);

      if (queryResult.rowCount >= activeUsersLimit) {
        throw 'activeLimitReached';
      }

      return User.create({ ...values })
        .fetch()
        .usingConnection(db);
    });
  }

  return User.create({ ...values }).fetch();
};

const getByIds = (ids, { withDeactivated = true } = {}) => {
  const criteria = {
    id: ids,
  };

  if (!withDeactivated) {
    criteria.isDeactivated = false;
  }

  return defaultFind(criteria);
};

const getAll = ({ roleOrRoles, isDeactivated } = {}) =>
  defaultFind({
    isDeactivated,
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

const getOneActiveByApiKeyHash = (apiKeyHash) =>
  User.findOne({
    apiKeyHash,
    isDeactivated: false,
  });

const updateOne = async (criteria, values) => {
  const { activeUsersLimit } = await InternalConfig.qm.getOneMain();
  const enforceActiveLimit = values.isDeactivated === false && activeUsersLimit !== null;

  if (!_.isUndefined(values.avatar) || enforceActiveLimit) {
    return sails.getDatastore().transaction(async (db) => {
      if (enforceActiveLimit) {
        const queryResult = await sails
          .sendNativeQuery('SELECT NULL FROM user_account WHERE is_deactivated = $1 FOR UPDATE', [
            false,
          ])
          .usingConnection(db);

        if (queryResult.rowCount >= activeUsersLimit) {
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

        prev = transformRowToModel(queryResult.rows[0]);
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

          uploadedFile = UploadedFile.qm.transformRowToModel(queryResult.rows[0]);
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

      uploadedFile = UploadedFile.qm.transformRowToModel(queryResult.rows[0]);
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
  getOneActiveByApiKeyHash,
  updateOne,
  deleteOne,
};
