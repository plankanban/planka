const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

// Update with your config settings.

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: 'migration'
  }
};
