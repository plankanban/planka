const POSITION_GAP = 65535;

module.exports.up = async (knex) => {
  await knex.schema.table('task', (table) => {
    /* Columns */

    table.specificType('position', 'double precision');

    /* Indexes */

    table.index('position');
  });

  const tasks = await knex('task').orderBy(['card_id', 'id']);

  let prevCardId;
  let position;

  // eslint-disable-next-line no-restricted-syntax
  for (task of tasks) {
    if (task.card_id === prevCardId) {
      position += POSITION_GAP;
    } else {
      prevCardId = task.card_id;
      position = POSITION_GAP;
    }

    // eslint-disable-next-line no-await-in-loop
    await knex('task')
      .update({
        position,
      })
      .where('id', task.id);
  }

  return knex.schema.table('task', (table) => {
    table.dropNullable('position');
  });
};

module.exports.down = async (knex) =>
  knex.schema.table('task', (table) => {
    table.dropColumn('position');
  });
