const POSITION_GAP = 65535;

const addPosition = async (knex, tableName, parentFieldName) => {
  await knex.schema.table(tableName, (table) => {
    /* Columns */

    table.specificType('position', 'double precision');

    /* Indexes */

    table.index('position');
  });

  const records = await knex(tableName).orderBy([parentFieldName, 'id']);

  let prevParentId;
  let position;

  // eslint-disable-next-line no-restricted-syntax
  for (record of records) {
    if (record[parentFieldName] === prevParentId) {
      position += POSITION_GAP;
    } else {
      prevParentId = record[parentFieldName];
      position = POSITION_GAP;
    }

    // eslint-disable-next-line no-await-in-loop
    await knex(tableName)
      .update({
        position,
      })
      .where('id', record.id);
  }

  return knex.schema.table(tableName, (table) => {
    table.dropNullable('position');
  });
};

const removePosition = (knex, tableName) =>
  knex.schema.table(tableName, (table) => {
    table.dropColumn('position');
  });

module.exports = {
  addPosition,
  removePosition,
};
