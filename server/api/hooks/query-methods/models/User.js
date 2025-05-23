/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => User.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => {
  if (sails.config.custom.activeUsersLimit) {
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

const updateOne = (criteria, values) => {
  if (values.isDeactivated === false && sails.config.custom.activeUsersLimit) {
    return sails.getDatastore().transaction(async (db) => {
      const queryResult = await sails
        .sendNativeQuery('SELECT NULL FROM user_account WHERE is_deactivated = $1 FOR UPDATE', [
          false,
        ])
        .usingConnection(db);

      if (queryResult.rowCount >= sails.config.custom.activeUsersLimit) {
        throw 'activeLimitReached';
      }

      return User.updateOne(criteria)
        .set({ ...values })
        .usingConnection(db);
    });
  }

  return User.updateOne(criteria).set({ ...values });
};

const deleteOne = (criteria) => User.destroyOne(criteria);

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
