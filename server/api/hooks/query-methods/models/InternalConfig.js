/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { makeRowToModelTransformer } = require('../helpers');

const transformRowToModel = makeRowToModelTransformer(InternalConfig);

/* Query methods */

const getOneMain = () => InternalConfig.findOne(InternalConfig.MAIN_ID);

const updateOneMain = (values) =>
  sails.getDatastore().transaction(async (db) => {
    let queryResult = await sails
      .sendNativeQuery(
        'SELECT active_users_limit FROM internal_config WHERE id = $1 LIMIT 1 FOR UPDATE',
        [InternalConfig.MAIN_ID],
      )
      .usingConnection(db);

    const prev = transformRowToModel(queryResult.rows[0]);

    const internalConfig = await InternalConfig.updateOne(InternalConfig.MAIN_ID)
      .set({ ...values })
      .usingConnection(db);

    let deactivatedUserIds;
    if (
      _.isInteger(internalConfig.activeUsersLimit) &&
      (prev.activeUsersLimit === null || internalConfig.activeUsersLimit < prev.activeUsersLimit)
    ) {
      const { defaultAdminEmail } = sails.config.custom;

      const query = `
        WITH user_to_deactivate AS (
          SELECT id
          FROM user_account
          WHERE is_deactivated = false
          ORDER BY
            CASE ${defaultAdminEmail ? 'WHEN email = $1 THEN 0 WHEN role = $2 THEN 1' : 'WHEN role = $1 THEN 0'} ELSE ${defaultAdminEmail ? '2' : '1'} END,
            id
          OFFSET $${defaultAdminEmail ? 3 : 2}
        )
        UPDATE user_account
        SET is_deactivated = true
        WHERE id IN (SELECT id FROM user_to_deactivate)
        RETURNING id
      `;

      const queryValues = defaultAdminEmail
        ? [defaultAdminEmail, User.Roles.ADMIN, internalConfig.activeUsersLimit]
        : [User.Roles.ADMIN, internalConfig.activeUsersLimit];

      queryResult = await sails.sendNativeQuery(query, queryValues).usingConnection(db);
      deactivatedUserIds = queryResult.rows.map((row) => row.id);
    }

    return { internalConfig, deactivatedUserIds, prev };
  });

module.exports = {
  getOneMain,
  updateOneMain,
};
