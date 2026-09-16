/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable no-console */

const bcrypt = require('bcrypt');
const validator = require('validator');

const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;

const buildUserData = () => {
  const data = {
    role: 'admin',
    isDeactivated: false,
  };

  if (process.env.DEFAULT_ADMIN_PASSWORD) {
    data.password = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD, 10);
  }
  if (process.env.DEFAULT_ADMIN_NAME) {
    if (process.env.DEFAULT_ADMIN_NAME.length > 128) {
      console.warn('Warning: DEFAULT_ADMIN_NAME exceeds 128 characters; truncating.');
      data.name = process.env.DEFAULT_ADMIN_NAME.slice(0, 128);
    } else {
      data.name = process.env.DEFAULT_ADMIN_NAME;
    }
  }
  if (process.env.DEFAULT_ADMIN_USERNAME) {
    const username = process.env.DEFAULT_ADMIN_USERNAME.toLowerCase();

    if (username.length < 3 || username.length > 32 || !USERNAME_REGEX.test(username)) {
      console.warn(
        `Warning: DEFAULT_ADMIN_USERNAME "${process.env.DEFAULT_ADMIN_USERNAME}" is invalid; skipping.`,
      );
    } else {
      data.username = username;
    }
  }

  return data;
};

const buildInternalConfigData = () => {
  const data = {};
  if (process.env.STORAGE_LIMIT) {
    data.storageLimit = process.env.STORAGE_LIMIT;
  }
  if (process.env.ACTIVE_USERS_LIMIT) {
    const activeUsersLimit = parseInt(process.env.ACTIVE_USERS_LIMIT, 10);

    if (Number.isInteger(activeUsersLimit)) {
      data.activeUsersLimit = activeUsersLimit;
    }
  }

  return data;
};

exports.seed = async (knex) => {
  const defaultAdminEmail =
    process.env.DEFAULT_ADMIN_EMAIL && process.env.DEFAULT_ADMIN_EMAIL.toLowerCase();

  // Nothing in here may throw. The seed runs on every start, not only on the
  // first one, and a throw here leaves the container in a restart loop with an
  // instance that used to come up fine. Bad input is reported and skipped; the
  // interactive `db:create-admin-user` is where invalid input is refused.
  const isDefaultAdminEmailUsable =
    defaultAdminEmail && validator.isEmail(defaultAdminEmail) && defaultAdminEmail.length <= 256;

  if (defaultAdminEmail && !isDefaultAdminEmailUsable) {
    console.warn(
      `Warning: DEFAULT_ADMIN_EMAIL "${process.env.DEFAULT_ADMIN_EMAIL}" is not a usable e-mail address; skipping the default admin user.`,
    );
  }

  if (isDefaultAdminEmailUsable) {
    const userData = buildUserData();

    if (userData.username) {
      const existingUsernameUser = await knex('user_account')
        .where('username', userData.username)
        .whereNot('email', defaultAdminEmail)
        .first();

      // Taken by somebody else, so it cannot be applied. The account itself is
      // still created or refreshed, it simply keeps the username it has.
      if (existingUsernameUser) {
        console.warn(
          `Warning: DEFAULT_ADMIN_USERNAME "${userData.username}" belongs to another user; leaving the username unchanged.`,
        );

        delete userData.username;
      }
    }

    let userId;
    try {
      [{ id: userId }] = await knex('user_account').insert(
        {
          ...userData,
          email: defaultAdminEmail,
          subscribeToOwnCards: false,
          subscribeToCardWhenCommenting: true,
          turnOffRecentCardHighlighting: false,
          enableFavoritesByDefault: true,
          defaultEditorMode: 'wysiwyg',
          defaultHomeView: 'groupedProjects',
          defaultProjectsOrder: 'byDefault',
          createdAt: new Date().toISOString(),
        },
        'id',
      );
    } catch (error) {
      /* empty */
    }

    if (!userId) {
      await knex('user_account').update(userData).where('email', defaultAdminEmail);
    }
  }

  const internalConfigData = buildInternalConfigData();

  let activeUsersLimit;
  if (Object.keys(internalConfigData).length > 0) {
    [{ active_users_limit: activeUsersLimit }] = await knex('internal_config')
      .update(internalConfigData)
      .returning('active_users_limit');
  } else {
    ({ active_users_limit: activeUsersLimit } = await knex('internal_config')
      .select('active_users_limit')
      .first());
  }

  if (Number.isInteger(activeUsersLimit)) {
    let orderByQuery;
    let orderByQueryValues;

    if (defaultAdminEmail) {
      orderByQuery = 'CASE WHEN email = ? THEN 0 WHEN role = ? THEN 1 ELSE 2 END';
      orderByQueryValues = [defaultAdminEmail, 'admin'];
    } else {
      orderByQuery = 'CASE WHEN role = ? THEN 0 ELSE 1 END';
      orderByQueryValues = 'admin';
    }

    const users = await knex('user_account')
      .select('id')
      .where('is_deactivated', false)
      .orderByRaw(orderByQuery, orderByQueryValues)
      .orderBy('id')
      .offset(activeUsersLimit);

    if (users.length > 0) {
      const userIds = users.map(({ id }) => id);

      await knex('user_account')
        .update({
          isDeactivated: true,
        })
        .whereIn('id', userIds);
    }
  }
};
