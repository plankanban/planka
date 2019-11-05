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
  },
  wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};
