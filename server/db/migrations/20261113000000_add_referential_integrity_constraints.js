/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * The foreign keys the schema never had.
 *
 * Integrity here has only ever been enforced by the `delete-related` cascades in
 * `api/helpers/*`, which are not transactional. When one died half-way it left a
 * child row pointing at a parent that no longer existed, nothing fired, nothing
 * logged, and the client eventually dereferenced one and white-screened (#8).
 * `utils/orphan-census` was the compensating control; this makes the orphan
 * unrepresentable instead of merely countable.
 *
 *
 * ---------------------------------------------------------------------------
 * GATED ON THE PURGE
 * ---------------------------------------------------------------------------
 * `ADD CONSTRAINT ... FOREIGN KEY` validates existing rows and aborts on the
 * first violation. A database that already has orphans cannot apply this
 * migration until `npm run db:orphan-purge -- --apply` has taken the census to
 * zero.
 * That is deliberate: it fails loudly on a dirty database rather than quietly
 * skipping the constraint.
 *
 * The referential action is not invented here -- it is read from
 * `PURGE_ACTIONS`, so the repair and the constraint can never drift apart:
 *
 *   delete  -> ON DELETE CASCADE   the child cannot exist without the parent
 *   nullify -> ON DELETE SET NULL  the column is a decoration; the row stands
 *
 * A CASCADE on a decoration edge would be catastrophic: `card.creator_user_id`
 * would delete every card a departing user ever made.
 */

const { ORPHAN_EDGES, edgeName } = require('../../utils/orphan-census');
const { PURGE_ACTIONS, NULLIFY } = require('../../utils/orphan-purge');

const constraintNameFor = (table, column) => `${table}_${column}_fkey`;

const edgesWithActions = () =>
  ORPHAN_EDGES.map((edge) => {
    const [table, column, parentTable] = edge;
    const action = PURGE_ACTIONS[edgeName(edge)];

    if (!action) {
      throw new Error(`No purge action declared for edge ${edgeName(edge)}`);
    }

    return {
      table,
      column,
      parentTable,
      onDelete: action === NULLIFY ? 'SET NULL' : 'CASCADE',
      constraint: constraintNameFor(table, column),
    };
  });

const columnExists = async (knex, table, column) => {
  const { rows } = await knex.raw(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?`,
    [table, column],
  );

  return rows.length > 0;
};

module.exports.up = async (knex) => {
  // The edge list is shared with the census; a schema change can drop a table
  // or column the list still names. Skip those edges loudly rather than abort
  // the whole migration on a schema that no longer has them.
  // eslint-disable-next-line no-restricted-syntax
  for (const { table, column, parentTable, onDelete, constraint } of edgesWithActions()) {
    /* eslint-disable no-await-in-loop */
    const tableHasEdge =
      (await columnExists(knex, table, column)) && (await columnExists(knex, parentTable, 'id'));
    /* eslint-enable no-await-in-loop */

    if (!tableHasEdge) {
      // eslint-disable-next-line no-console
      console.warn(
        `[referential-integrity] skipping missing edge ${table}.${column} -> ${parentTable}.id`,
      );
      // eslint-disable-next-line no-continue
      continue;
    }

    // Idempotent: a re-run after a partial failure must not abort on the
    // constraints that already landed.
    // eslint-disable-next-line no-await-in-loop
    await knex.raw(
      `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${constraint}", ` +
        `ADD CONSTRAINT "${constraint}" FOREIGN KEY ("${column}") ` +
        `REFERENCES "${parentTable}" ("id") ON DELETE ${onDelete}`,
    );
  }
};

module.exports.down = async (knex) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const { table, constraint } of edgesWithActions()) {
    // eslint-disable-next-line no-await-in-loop
    await knex.raw(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${constraint}"`);
  }
};
