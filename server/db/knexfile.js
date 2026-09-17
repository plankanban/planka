/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const path = require('path');
const dotenv = require('dotenv');
const _ = require('lodash');

const { resolveDatabaseConfig } = require('../utils/database-config');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});

// Resolved after the environment file is loaded, and by the same code the app
// uses, so that a `db:` script run by hand connects exactly as the app does
const { url, ssl, searchPath } = resolveDatabaseConfig();

module.exports = {
  client: 'pg',
  connection: {
    connectionString: url,
    ssl,
  },
  searchPath,
  migrations: {
    tableName: 'migration',
    directory: path.join(__dirname, 'migrations'),
    // Without this the migration table lands in whichever schema the search path
    // happens to resolve to first, which is not necessarily the one the tables
    // were created in
    schemaName: searchPath && searchPath[0],
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
  wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};
