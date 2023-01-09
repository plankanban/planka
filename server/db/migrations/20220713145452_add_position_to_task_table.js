const { addPosition, removePosition } = require('../../utils/migrations');

module.exports.up = (knex) => addPosition(knex, 'task', 'card_id');

module.exports.down = (knex) => removePosition(knex, 'task');
