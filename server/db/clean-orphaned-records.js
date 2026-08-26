/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */

const { read } = require('read');
const initKnex = require('knex');

const knexfile = require('./knexfile');

const SAMPLE_SIZE = 5;

// Reference rows that carry no content of their own: once the project or board
// they point at is gone they are unusable, and the client builds its project
// list from them, so a single leftover row can take the whole home view down
const REMOVABLE = [
  {
    table: 'project_manager',
    description: 'project managers of a missing project',
    whereRaw: 'NOT EXISTS (SELECT 1 FROM project WHERE project.id = project_manager.project_id)',
  },
  {
    table: 'project_favorite',
    description: 'favorites of a missing project',
    whereRaw: 'NOT EXISTS (SELECT 1 FROM project WHERE project.id = project_favorite.project_id)',
  },
  // Only the board is checked here: the project is denormalized onto the row and
  // the client resolves it through the board, so a stale project alone is a
  // repairable inconsistency and deleting the row would revoke real board access
  {
    table: 'board_membership',
    description: 'board memberships of a missing board',
    whereRaw: 'NOT EXISTS (SELECT 1 FROM board WHERE board.id = board_membership.board_id)',
  },
  {
    table: 'board_subscription',
    description: 'board subscriptions of a missing board',
    whereRaw: 'NOT EXISTS (SELECT 1 FROM board WHERE board.id = board_subscription.board_id)',
  },
];

// Reported but never touched: removing these would take user content with them,
// or the repair depends on which of the two sides is meant to win
const REPORTABLE = [
  {
    table: 'board',
    description: 'boards of a missing project',
    whereRaw: 'NOT EXISTS (SELECT 1 FROM project WHERE project.id = board.project_id)',
  },
  {
    table: 'list',
    description: 'lists of a missing board',
    whereRaw: 'NOT EXISTS (SELECT 1 FROM board WHERE board.id = list.board_id)',
  },
  {
    table: 'card',
    description: 'cards of a missing list',
    whereRaw: 'NOT EXISTS (SELECT 1 FROM list WHERE list.id = card.list_id)',
  },
  {
    table: 'notification_service',
    description: 'notification services of a missing board',
    whereRaw: `board_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM board WHERE board.id = notification_service.board_id)`,
  },
  {
    table: 'project',
    description: 'projects owned by a missing project manager',
    whereRaw: `owner_project_manager_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM project_manager WHERE project_manager.id = project.owner_project_manager_id)`,
  },
  {
    table: 'board_membership',
    description: 'board memberships whose denormalized project does not match their board',
    whereRaw: `EXISTS (
      SELECT 1 FROM board
      WHERE board.id = board_membership.board_id
        AND board.project_id <> board_membership.project_id
    )`,
  },
];

const knex = initKnex(knexfile);

const findOrphans = async ({ table, whereRaw }) => {
  const rows = await knex(table).select('id').whereRaw(whereRaw).orderBy('id');
  return rows.map(({ id }) => id);
};

const report = (checks, idsByCheck) => {
  let total = 0;

  checks.forEach((check, index) => {
    const ids = idsByCheck[index];
    total += ids.length;

    if (ids.length === 0) {
      return;
    }

    const sample = ids.slice(0, SAMPLE_SIZE).join(', ');
    const rest = ids.length > SAMPLE_SIZE ? `, and ${ids.length - SAMPLE_SIZE} more` : '';

    console.log(`  ${check.table}: ${ids.length} ${check.description}`);
    console.log(`    ids: ${sample}${rest}`);
  });

  return total;
};

const confirmBackup = async () => {
  if (!process.stdin.isTTY) {
    throw new Error('Refusing to delete without a terminal to confirm the backup on');
  }

  const answer = await read({
    prompt: 'Have you created a backup of this database? Type "yes" to continue: ',
  });

  if (answer.trim().toLowerCase() !== 'yes') {
    throw new Error('Aborted, nothing was deleted');
  }
};

(async () => {
  try {
    const isApplying = process.argv.includes('--apply');

    const removableIds = [];
    for (const check of REMOVABLE) {
      removableIds.push(await findOrphans(check));
    }

    const reportableIds = [];
    for (const check of REPORTABLE) {
      reportableIds.push(await findOrphans(check));
    }

    console.log('Removable orphaned records:');
    const removableTotal = report(REMOVABLE, removableIds);

    if (removableTotal === 0) {
      console.log('  none');
    }

    console.log('\nOther inconsistencies (reported only, never deleted by this script):');

    if (report(REPORTABLE, reportableIds) === 0) {
      console.log('  none');
    }

    if (!isApplying) {
      console.log('\nDry run, nothing was deleted. Pass --apply to delete the removable records.');
      return;
    }

    if (removableTotal === 0) {
      return;
    }

    console.log('');
    await confirmBackup();

    await knex.transaction(async (trx) => {
      for (const [index, check] of REMOVABLE.entries()) {
        const ids = removableIds[index];

        if (ids.length > 0) {
          await trx(check.table).whereIn('id', ids).delete();
          console.log(`Deleted ${ids.length} from ${check.table}`);
        }
      }
    });

    console.log(`\nDeleted ${removableTotal} orphaned records.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await knex.destroy();
  }
})();
