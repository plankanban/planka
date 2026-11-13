/**
 * Test support for the FK constraints added by
 * `db/migrations/20261113000000_add_referential_integrity_constraints.js`.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * Two suites deliberately create states the database now forbids:
 *
 *   - `delete-related.test.js` simulates a cascade dying half-way and asserts the
 *     APPLICATION deleted children before parents.
 *   - `orphan-purge.test.js` manufactures orphans and repairs them.
 *
 * With foreign keys in place Postgres either blocks the setup outright or, worse,
 * quietly does the cleanup itself -- at which point `expect(census).to.equal(0)`
 * passes no matter what the application code did, and a suite that exists to catch
 * a regression can no longer catch it. Turning enforcement off for the duration
 * keeps those suites testing the thing they were written to test.
 *
 * ---------------------------------------------------------------------------
 * WHY NOT `SET session_replication_role = 'replica'`
 * ---------------------------------------------------------------------------
 * That is the usual advice and it is wrong here. It is a SESSION setting, and
 * Waterline hands queries to a connection POOL. MEASURED 2026-08-12 against
 * Postgres 18: with sequential queries the pool reuses one backend, the setting
 * appears to stick, and it looks fine. Force concurrency and 5 of 8 orphan inserts
 * came back "violates foreign key constraint" -- the other backends never saw the
 * SET. That is an intermittently failing test suite, which costs more than an
 * honestly failing one.
 *
 * `ALTER TABLE ... DISABLE TRIGGER ALL` is a property of the TABLE, so no
 * connection can miss it. Same measurement: 8 of 8 concurrent inserts succeeded
 * while disabled, 8 of 8 blocked again after re-enabling.
 *
 * Requires a superuser (FK triggers are internal). The test databases are.
 */

const { ORPHAN_EDGES } = require('../../utils/orphan-census');

const TABLES = [
  ...new Set(ORPHAN_EDGES.flatMap(([table, , parentTable]) => [table, parentTable])),
].sort();

const setTriggers = async (state) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const table of TABLES) {
    // eslint-disable-next-line no-await-in-loop
    await sails.sendNativeQuery(`ALTER TABLE "${table}" ${state} TRIGGER ALL`);
  }
};

const disableForeignKeys = () => setTriggers('DISABLE');

const enableForeignKeys = () => setTriggers('ENABLE');

/**
 * Wire a suite so foreign keys are inert inside it and enforced again afterwards.
 * `after` runs even if a test throws, so enforcement cannot leak into other suites.
 */
const withoutForeignKeys = () => {
  beforeEach(disableForeignKeys);
  afterEach(enableForeignKeys);
};

module.exports = {
  TABLES,
  disableForeignKeys,
  enableForeignKeys,
  withoutForeignKeys,
};
