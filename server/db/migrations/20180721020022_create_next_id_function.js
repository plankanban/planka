module.exports.up = (knex) =>
  knex.raw(`
    CREATE SEQUENCE next_id_seq;
    CREATE FUNCTION next_id(OUT id BIGINT) AS $$
      DECLARE
        shard INT := 1;
        epoch BIGINT := 1567191600000;
        sequence BIGINT;
        milliseconds BIGINT;
      BEGIN
        SELECT nextval('next_id_seq') % 1024 INTO sequence;
        SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO milliseconds;
        id := (milliseconds - epoch) << 23;
        id := id | (shard << 10);
        id := id | (sequence);
      END;
    $$ LANGUAGE PLPGSQL;
  `);

module.exports.down = (knex) =>
  knex.raw(`
    DROP SEQUENCE next_id_seq;
    DROP FUNCTION next_id(OUT id BIGINT);
  `);
