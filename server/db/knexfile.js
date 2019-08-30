require('dotenv').config({
  path: '..'
});

// Update with your config settings.

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: 'migration'
  }
};
