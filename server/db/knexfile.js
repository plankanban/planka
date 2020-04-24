const path = require('path');
const _ = require('lodash');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: 'migration',
    directory: path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
  wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};
