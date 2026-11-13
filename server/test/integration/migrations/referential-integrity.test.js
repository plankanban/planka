/**
 * Coverage for the FK constraints added by
 * `db/migrations/20261113000000_add_referential_integrity_constraints.js`.
 *
 * The other two integration suites deliberately switch these constraints OFF, because
 * they are about what the application cascade does. That leaves the constraints
 * themselves untested, so this suite is the other side: it asserts they exist, that
 * they carry the referential action the purge policy asks for, and that they actually
 * enforce -- with foreign keys ON, as production has them.
 *
 * The `SET NULL` case matters most. A `CASCADE` on `card.creator_user_id` would delete
 * every card a departing user ever made. That is one wrong word in a generated
 * statement, so it is asserted directly rather than inferred from the policy table.
 *
 * Requires a real Postgres (TEST_DATABASE_URL) with migrations applied.
 */

const { expect } = require('chai');

const { ORPHAN_EDGES, edgeName } = require('../../../utils/orphan-census');
const { PURGE_ACTIONS, NULLIFY } = require('../../../utils/orphan-purge');

const { TEST_DATABASE_URL } = process.env;

const constraintNameFor = (table, column) => `${table}_${column}_fkey`;

const deleteRules = async () => {
  const { rows } = await sails.sendNativeQuery(
    `SELECT tc.constraint_name, tc.table_name, rc.delete_rule
       FROM information_schema.table_constraints tc
       JOIN information_schema.referential_constraints rc
         ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'`,
  );

  return new Map(rows.map((row) => [row.constraint_name, row.delete_rule]));
};

(TEST_DATABASE_URL ? describe : describe.skip)('referential integrity constraints', () => {
  it('declares a foreign key for every edge the census watches', async () => {
    const rules = await deleteRules();

    const missing = ORPHAN_EDGES.map(([table, column]) => constraintNameFor(table, column)).filter(
      (name) => !rules.has(name),
    );

    expect(missing).to.deep.equal([], `missing foreign keys: ${missing.join(', ')}`);
  });

  it('uses SET NULL exactly where the purge policy nullifies, and CASCADE elsewhere', async () => {
    const rules = await deleteRules();

    const wrong = ORPHAN_EDGES.map((edge) => {
      const [table, column] = edge;
      const expected = PURGE_ACTIONS[edgeName(edge)] === NULLIFY ? 'SET NULL' : 'CASCADE';
      const actual = rules.get(constraintNameFor(table, column));

      return actual === expected ? null : `${edgeName(edge)}: expected ${expected}, got ${actual}`;
    }).filter(Boolean);

    expect(wrong).to.deep.equal([]);
  });

  it('never cascades a delete through a user reference', async () => {
    // Named separately from the policy-driven check above: if someone "fixes" the
    // policy, that test follows them and stays green. This one does not.
    const rules = await deleteRules();

    ['card_creator_user_id_fkey', 'comment_user_id_fkey', 'task_assignee_user_id_fkey'].forEach(
      (name) => {
        expect(rules.get(name)).to.equal('SET NULL', `${name} must not cascade`);
      },
    );
  });

  it('refuses an orphan row outright', async () => {
    let error;

    try {
      await sails.sendNativeQuery(
        'INSERT INTO "card_label" ("card_id", "label_id") VALUES (900000000000000001, 900000000000000002)',
      );
    } catch (e) {
      error = e;
    }

    expect(error, 'the database should have rejected the orphan').to.not.equal(undefined);
    expect(String(error.message)).to.contain('foreign key');
  });
});
