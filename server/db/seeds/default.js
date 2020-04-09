const bcrypt = require('bcrypt');

exports.seed = (knex) => {
  const date = new Date().toUTCString();

  return knex('user_account').insert({
    email: 'demo@demo.demo',
    password: bcrypt.hashSync('demo', 10),
    isAdmin: true,
    name: 'Demo Demo',
    username: 'demo',
    subscribeToOwnCards: false,
    createdAt: date,
    updatedAt: date,
  });
};
