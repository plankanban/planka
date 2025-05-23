/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');

const buildData = () => {
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

exports.seed = async (knex) => {
  const email = process.env.DEFAULT_ADMIN_EMAIL && process.env.DEFAULT_ADMIN_EMAIL.toLowerCase();

  if (email) {
    const data = buildData();

    let userId;
    try {
      [{ id: userId }] = await knex('user_account').insert(
        {
          ...data,
          email,
          subscribeToOwnCards: false,
          subscribeToCardWhenCommenting: true,
          turnOffRecentCardHighlighting: false,
          enableFavoritesByDefault: false,
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
      await knex('user_account').update(data).where('email', email);
    }
  }

  const activeUsersLimit = parseInt(process.env.ACTIVE_USERS_LIMIT, 10);

  if (!Number.isNaN(activeUsersLimit)) {
    let orderByQuery;
    let orderByQueryValues;

    if (email) {
      orderByQuery = 'CASE WHEN email = ? THEN 0 WHEN role = ? THEN 1 ELSE 2 END';
      orderByQueryValues = [email, 'admin'];
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
