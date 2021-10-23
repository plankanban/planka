const config = require('./knexfile');

const knex = require('knex')(config); // eslint-disable-line import/order

(async () => {
  try {
    const isExists = await knex.schema.hasTable(config.migrations.tableName);

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
