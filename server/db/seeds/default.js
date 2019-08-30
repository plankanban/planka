const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  const date = new Date().toUTCString();

  return knex('user').insert({
    /* eslint-disable camelcase */
    email: 'demo@demo.demo',
    password: bcrypt.hashSync('demo', 10),
    is_admin: true,
    name: 'Demo Demo',
    created_at: date,
    updated_at: date
    /* eslint-enable camelcase */
  });
};
