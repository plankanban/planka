/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');

const buildUserData = () => {
  const data = {
    role: 'admin',
    isSsoUser: false,
    isDeactivated: false,
  };

  if (process.env.DEFAULT_ADMIN_PASSWORD) {
    data.password = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD, 10);
  }
  if (process.env.DEFAULT_ADMIN_NAME) {
    data.name = process.env.DEFAULT_ADMIN_NAME;
  }
  if (process.env.DEFAULT_ADMIN_USERNAME) {
    data.username = process.env.DEFAULT_ADMIN_USERNAME.toLowerCase();
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

  if (defaultAdminEmail) {
    const userData = buildUserData();

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
