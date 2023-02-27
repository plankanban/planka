const path = require('path');
const dotenv = require('dotenv');
const _ = require('lodash');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
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
