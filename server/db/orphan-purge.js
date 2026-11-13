/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Referential-integrity repair -- the operator-invoked companion to the read-only
 * census. DRY RUN BY DEFAULT.
 *
 *   npm run db:orphan-purge                      # report what WOULD change
 *   npm run db:orphan-purge -- --json            # same, machine-readable
 *   npm run db:orphan-purge -- --apply           # actually repair
 *   npm run db:orphan-purge -- --apply --batch=200
 *
 * Deleting rows from a live kanban database is an operator decision, which is why
 * this is a separate command and not a mode of `orphan-census.js`.
 *
 * Every repaired row is snapshotted first, into `purge_backup_<stamp>_<table>`
 * (deleted rows, in full) and `purge_backup_<stamp>_nullified` (old FK values).
 * Snapshot and repair share one statement, so they cannot disagree. Nothing here
 * drops those tables -- reclaiming them is a later, separate decision.
 *
 * PASSES. Repair cascades: deleting an orphaned `custom_field_group` orphans the
 * `custom_field` rows beneath it. So this runs repeated passes until a pass
 * changes nothing, rather than trusting a hand-written children-before-parents
 * ordering to be complete. `--max-passes` bounds it; exhausting it is a failure,
 * not a success, because it means the repair did not converge.
 *
 * Uses DATABASE_URL via db/knexfile.js, same as `npm run db:migrate`.
 */

const knexLib = require('knex');

const knexConfig = require('./knexfile');
const { ORPHAN_EDGES, edgeName, buildCensusQuery, summarize } = require('../utils/orphan-census');
const {
  NULLIFY,
  actionFor,
  assertPolicyCoversEdges,
  buildBackupTableQuery,
  buildNullifyBackupTableQuery,
  buildPurgeBatchQuery,
} = require('../utils/orphan-purge');

const parseArgs = (argv) => {
  const numeric = (flag, fallback) => {
    const found = argv.find((arg) => arg.startsWith(`${flag}=`));

    if (!found) {
      return fallback;
    }

    const value = Number(found.slice(flag.length + 1));

    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${flag} must be a positive integer`);
    }

    return value;
  };

  return {
    apply: argv.includes('--apply'),
    json: argv.includes('--json'),
    batch: numeric('--batch', 500),
    maxPasses: numeric('--max-passes', 10),
  };
};

const census = async (knex) => {
  const { rows } = await knex.raw(buildCensusQuery());
  const result = summarize(rows);

  if (Object.keys(result.totalsByEdge).length !== ORPHAN_EDGES.length) {
    throw new Error('Orphan census returned fewer edges than it asked for');
  }

  return result;
};

/**
 * A `SET NULL` against a NOT NULL column aborts the statement, which would leave
 * the purge half-done. Catch the contradiction before touching anything.
 */
const assertNullifyEdgesAreNullable = async (knex) => {
  const { rows } = await knex.raw(
    "SELECT table_name, column_name, is_nullable FROM information_schema.columns WHERE table_schema = 'public'",
  );

  const nullableByKey = new Map(rows.map((row) => [`${row.table_name}.${row.column_name}`, row]));

  const conflicts = ORPHAN_EDGES.filter((edge) => actionFor(edge) === NULLIFY).flatMap((edge) => {
    const name = edgeName(edge);
    const column = nullableByKey.get(name);

    if (!column) {
      return [`${name} (column not present in this database)`];
    }

    return column.is_nullable === 'YES' ? [] : [`${name} (declared NOT NULL)`];
  });

  if (conflicts.length > 0) {
    throw new Error(`Policy says nullify, schema forbids it: ${conflicts.join(', ')}`);
  }
};

const stampFor = (date) =>
  `t${date.toISOString().slice(0, 19).replace('T', '_').replace(/[-:]/g, '')}`.toLowerCase();

/**
 * The snapshot table an edge needs, created on demand. Doing this lazily rather
 * than up front matters on a live database: a purge that touches four tables
 * should not leave twenty-odd empty `purge_backup_*` tables behind for an
 * operator to wonder about later.
 */
const prepareBackupFor = async (knex, edge, stamp) => {
  if (actionFor(edge) === NULLIFY) {
    await knex.raw(buildNullifyBackupTableQuery(stamp));

    return;
  }

  await knex.raw(buildBackupTableQuery(edge[0], stamp));
};

/** One pass over every orphaned edge. Returns rows repaired, by edge. */
const runPass = async (knex, orphanedEdges, { stamp, batch }) => {
  const repaired = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [name] of orphanedEdges) {
    const edge = ORPHAN_EDGES.find((candidate) => edgeName(candidate) === name);
    let total = 0;
    let done = false;

    // eslint-disable-next-line no-await-in-loop
    await prepareBackupFor(knex, edge, stamp);

    while (!done) {
      // Each batch is its own transaction: an interrupted purge leaves a
      // consistent prefix repaired rather than a half-written batch.
      // eslint-disable-next-line no-await-in-loop
      const { rows } = await knex.transaction((trx) =>
        trx.raw(buildPurgeBatchQuery(edge, { stamp, limit: batch })),
      );

      total += rows.length;
      done = rows.length < batch;
    }

    if (total > 0) {
      repaired[name] = total;
    }
  }

  return repaired;
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.DATABASE_URL) {
    process.stderr.write('DATABASE_URL is not set\n');
    process.exitCode = 2;
    return;
  }

  assertPolicyCoversEdges();

  const knex = knexLib(knexConfig);
  const stamp = stampFor(new Date());
  const report = { applied: options.apply, stamp, passes: [] };

  try {
    await assertNullifyEdgesAreNullable(knex);

    const before = await census(knex);
    report.before = { total: before.total, byEdge: Object.fromEntries(before.orphanedEdges) };

    if (!options.apply) {
      report.plan = before.orphanedEdges.map(([name, total]) => ({
        edge: name,
        total,
        action: actionFor(ORPHAN_EDGES.find((edge) => edgeName(edge) === name)),
      }));
      report.note = 'dry run -- nothing was modified; pass --apply to repair';
    } else if (before.total > 0) {
      let remaining = before;

      // eslint-disable-next-line no-restricted-syntax
      for (const pass of Array.from({ length: options.maxPasses }, (_, index) => index + 1)) {
        // eslint-disable-next-line no-await-in-loop
        const repaired = await runPass(knex, remaining.orphanedEdges, {
          stamp,
          batch: options.batch,
        });
        // eslint-disable-next-line no-await-in-loop
        remaining = await census(knex);

        report.passes.push({
          pass,
          repaired,
          repairedTotal: Object.values(repaired).reduce((sum, count) => sum + count, 0),
          remaining: remaining.total,
        });

        if (remaining.total === 0) {
          break;
        }
      }

      report.after = {
        total: remaining.total,
        byEdge: Object.fromEntries(remaining.orphanedEdges),
      };

      if (remaining.total > 0) {
        report.error = `purge did not converge in ${options.maxPasses} passes`;
        process.exitCode = 1;
      }
    }

    if (options.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      process.stdout.write(`orphan purge (${options.apply ? 'APPLIED' : 'dry run'})\n`);
      process.stdout.write(`  backup stamp: ${stamp}\n`);
      process.stdout.write(`  orphans before: ${report.before.total}\n`);

      (report.plan || []).forEach(({ edge, total, action }) => {
        process.stdout.write(`    ${action.padEnd(7)} ${edge} (${total})\n`);
      });

      report.passes.forEach(({ pass, repairedTotal, remaining }) => {
        process.stdout.write(`  pass ${pass}: repaired ${repairedTotal}, remaining ${remaining}\n`);
      });

      if (report.note) {
        process.stdout.write(`  ${report.note}\n`);
      }

      if (report.error) {
        process.stdout.write(`  ERROR: ${report.error}\n`);
      }
    }
  } finally {
    await knex.destroy();
  }
};

run().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
