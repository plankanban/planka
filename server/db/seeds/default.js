const bcrypt = require('bcrypt');

exports.seed = (knex) =>
  knex('user_account').insert({
    email: 'demo@demo.demo',
    password: bcrypt.hashSync('demo', 10),
    isAdmin: true,
    name: 'Demo Demo',
    username: 'demo',
    subscribeToOwnCards: false,
    createdAt: new Date().toISOString(),
  });
