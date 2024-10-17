const { addPosition, removePosition } = require('../../utils/migrations');

module.exports.up = (knex) => addPosition(knex, 'label', 'board_id');

module.exports.down = (knex) => removePosition(knex, 'label');
