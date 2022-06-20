const initKnex = require('knex');

const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

(async () => {
  try {
    const isExists = await knex.schema.hasTable(knexfile.migrations.tableName);

    await knex.migrate.latest();
    if (!isExists) {
      await knex.seed.run();
    }
  } catch (error) {
    process.exitCode = 1;

    throw error;
  } finally {
    knex.destroy();
  }
})();
