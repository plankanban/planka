/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Referential-integrity census -- READ ONLY.
 *
 *   npm run db:orphan-census                # human-readable report
 *   npm run db:orphan-census -- --json      # machine-readable, for monitoring
 *   npm run db:orphan-census -- --strict    # exit 1 if any orphan exists
 *   npm run db:orphan-census -- --ids       # also list offending ids per edge
 *
 * Counts rows whose foreign key points at a row that no longer exists. The
 * schema declares no FK constraints, so this is the only thing that will tell
 * you. It issues SELECTs and nothing else -- there is deliberately no repair
 * mode here, because deleting rows in a production kanban database is an
 * operator decision, not a script's.
 *
 * Uses DATABASE_URL via db/knexfile.js, same as `npm run db:migrate`.
 */

const knexLib = require('knex');

const knexConfig = require('./knexfile');
const {
  ORPHAN_EDGES,
  buildCensusQuery,
  buildSelectQuery,
  summarize,
} = require('../utils/orphan-census');

const parseArgs = (argv) => ({
  json: argv.includes('--json'),
  strict: argv.includes('--strict'),
  ids: argv.includes('--ids'),
});

const run = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.DATABASE_URL) {
    process.stderr.write('DATABASE_URL is not set\n');
    process.exitCode = 2;
    return;
  }

  const knex = knexLib(knexConfig);

  try {
    const { rows } = await knex.raw(buildCensusQuery());
    const { totalsByEdge, orphanedEdges, total } = summarize(rows);

    if (Object.keys(totalsByEdge).length !== ORPHAN_EDGES.length) {
      throw new Error('Orphan census returned fewer edges than it asked for');
    }

    const idsByEdge = {};
    if (options.ids) {
      // eslint-disable-next-line no-restricted-syntax
      for (const edge of ORPHAN_EDGES) {
        const name = `${edge[0]}.${edge[1]}`;

        if (totalsByEdge[name] > 0) {
          // eslint-disable-next-line no-await-in-loop
          const result = await knex.raw(buildSelectQuery(edge));
          idsByEdge[name] = result.rows;
        }
      }
    }

    if (options.json) {
      process.stdout.write(
        `${JSON.stringify(
          {
            checkedAt: new Date().toISOString(),
            edgesChecked: ORPHAN_EDGES.length,
            total,
            totalsByEdge,
            ...(options.ids ? { idsByEdge } : {}),
          },
          null,
          2,
        )}\n`,
      );
    } else {
      process.stdout.write(`Orphan census -- ${ORPHAN_EDGES.length} foreign-key edges checked\n`);

      if (orphanedEdges.length === 0) {
        process.stdout.write('No orphaned rows.\n');
      } else {
        const width = Math.max(...orphanedEdges.map(([name]) => name.length));

        orphanedEdges.forEach(([name, count]) => {
          process.stdout.write(`  ${name.padEnd(width)}  ${String(count).padStart(7)}\n`);

          (idsByEdge[name] || []).forEach((row) => {
            process.stdout.write(`      id=${row.id} -> missing ${JSON.stringify(row)}\n`);
          });
        });

        process.stdout.write(`  ${'TOTAL'.padEnd(width)}  ${String(total).padStart(7)}\n`);
      }
    }

    if (options.strict && total > 0) {
      process.exitCode = 1;
    }
  } finally {
    await knex.destroy();
  }
};

run().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 2;
});
