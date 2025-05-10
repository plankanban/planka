/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const path = require('path');
const dotenv = require('dotenv');
const _ = require('lodash');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

function buildSSLConfig() {
  if (process.env.KNEX_REJECT_UNAUTHORIZED_SSL_CERTIFICATE === 'false') {
    return {
      rejectUnauthorized: false,
    };
  }

  return false;
}

module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: buildSSLConfig(),
  },
  migrations: {
    tableName: 'migration',
    directory: path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
  wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};
