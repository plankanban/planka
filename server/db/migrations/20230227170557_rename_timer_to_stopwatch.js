module.exports.up = (knex) =>
  knex.schema.table('card', (table) => {
    table.renameColumn('timer', 'stopwatch');
  });

module.exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.renameColumn('stopwatch', 'timer');
  });
