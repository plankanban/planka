const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  const date = new Date().toUTCString();

  return knex('user').insert({
    email: 'demo@demo.demo',
    password: bcrypt.hashSync('demo', 10),
    isAdmin: true,
    name: 'Demo Demo',
    createdAt: date,
    updatedAt: date
  });
};
