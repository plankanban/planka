const config = require('./knexfile');
const knex = require('knex')(config);

(async function () {
  try {
    const exists = await knex.schema.hasTable(config.migrations.tableName);

    if (!exists) {
      await knex.migrate.latest();
      await knex.seed.run();
    }
  } catch (error) {
    process.exitCode = 1;

    throw error;
  } finally {
    knex.destroy();
  }
})();
