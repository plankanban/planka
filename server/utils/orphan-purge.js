/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Repair policy for the rows `utils/orphan-census` counts.
 *
 * The census is deliberately read-only. This module is the other half: for every
 * edge it says what an operator should DO with a row whose parent is gone, and it
 * builds the SQL to do it. The runner is `db/orphan-purge.js`
 * (`npm run db:orphan-purge`), which dry-runs by default.
 *
 * ---------------------------------------------------------------------------
 * THE ONLY DECISION THAT MATTERS HERE: `delete` vs `nullify`
 * ---------------------------------------------------------------------------
 * A dangling FK means one of two very different things, and getting them the
 * wrong way round destroys live data:
 *
 *   delete   The row is MEANINGLESS without its parent. A `card_label` whose
 *            card is gone, a `notification` for a deleted board, a
 *            `custom_field_value` whose card no longer exists -- these are
 *            fragments of an interrupted cascade and nothing can render them.
 *
 *   nullify  The column is a DECORATION on a row that still stands on its own.
 *            `card.creator_user_id` is the clearest case: the user was deleted,
 *            the card is still a real card on a real board. Deleting the card
 *            because its author left would be a catastrophic misreading of the
 *            same symptom. Same for a cover attachment, a previous list, a task
 *            assignee, a project background image.
 *
 * Every `nullify` edge is asserted nullable against `information_schema` before
 * anything runs -- a `SET NULL` on a NOT NULL column would abort mid-purge.
 *
 * NOTE ON COVERAGE, so nobody reads more into a green run than it earned: on the
 * 2026-08-12 production census all 17 non-zero edges were `delete` edges. Every
 * `nullify` edge stood at zero, so that branch was NOT exercised against prod and
 * is covered by tests only.
 */

const { ORPHAN_EDGES, edgeName } = require('./orphan-census');

const DELETE = 'delete';
const NULLIFY = 'nullify';

/**
 * `table.column` -> action. Must cover every edge in ORPHAN_EDGES; the runner
 * refuses to start if it does not, so a newly added edge cannot be silently
 * skipped by the repair while still being counted by the census.
 */
const PURGE_ACTIONS = {
  'action.board_id': DELETE,
  'action.card_id': DELETE,
  'action.user_id': NULLIFY, // the activity entry survives its author
  'attachment.card_id': DELETE,
  'attachment.creator_user_id': NULLIFY, // the file survives its uploader
  'background_image.project_id': DELETE,
  'background_image.uploaded_file_id': DELETE,
  'base_custom_field_group.project_id': DELETE,
  'board.project_id': DELETE,
  'board_membership.board_id': DELETE,
  'board_membership.project_id': DELETE,
  'board_membership.user_id': DELETE,
  'board_subscription.board_id': DELETE,
  'board_subscription.user_id': DELETE,
  'card.board_id': DELETE,
  'card.cover_attachment_id': NULLIFY, // cover picture gone, card is fine
  'card.creator_user_id': NULLIFY, // author gone, card is fine
  'card.list_id': DELETE,
  'card.prev_list_id': NULLIFY, // a move-history hint, not structure
  'card_label.card_id': DELETE,
  'card_label.label_id': DELETE,
  'card_membership.card_id': DELETE,
  'card_membership.user_id': DELETE,
  'card_subscription.card_id': DELETE,
  'card_subscription.user_id': DELETE,
  'comment.card_id': DELETE,
  'comment.user_id': NULLIFY, // the comment text survives its author
  'custom_field.base_custom_field_group_id': DELETE,
  'custom_field.custom_field_group_id': DELETE,
  'custom_field_group.base_custom_field_group_id': NULLIFY, // group may stand alone
  'custom_field_group.board_id': DELETE,
  'custom_field_group.card_id': DELETE,
  'custom_field_value.card_id': DELETE,
  'custom_field_value.custom_field_group_id': DELETE,
  'custom_field_value.custom_field_id': DELETE,
  'identity_provider_user.user_id': DELETE,
  'label.board_id': DELETE,
  'list.board_id': DELETE,
  'notification.action_id': DELETE,
  'notification.board_id': DELETE,
  'notification.card_id': DELETE,
  'notification.comment_id': DELETE,
  'notification.creator_user_id': NULLIFY, // notification survives its actor
  'notification.user_id': DELETE,
  'notification_service.board_id': DELETE,
  'notification_service.user_id': DELETE,
  'project.background_image_id': NULLIFY, // decoration
  'project.owner_project_manager_id': NULLIFY, // project outlives its owner record
  'project_favorite.project_id': DELETE,
  'project_favorite.user_id': DELETE,
  'project_manager.project_id': DELETE,
  'project_manager.user_id': DELETE,
  'session.user_id': DELETE,
  'task.assignee_user_id': NULLIFY, // task survives its assignee
  'task.linked_card_id': NULLIFY, // a link, not ownership
  'task.task_list_id': DELETE,
  'task_list.card_id': DELETE,
  'webhook.board_id': DELETE,
};

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]*$/;

const assertSafeIdentifier = (value) => {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Unsafe SQL identifier in orphan purge: ${value}`);
  }

  return value;
};

const actionFor = (edge) => {
  const name = edgeName(edge);
  const action = PURGE_ACTIONS[name];

  if (!action) {
    throw new Error(`No purge action declared for edge ${name}`);
  }

  return action;
};

/**
 * Fails unless the policy covers exactly the census's edge set. Fail-closed: an
 * edge that is counted but not classified must stop the purge, not be skipped.
 */
const assertPolicyCoversEdges = (edges = ORPHAN_EDGES) => {
  const declared = new Set(Object.keys(PURGE_ACTIONS));
  const counted = new Set(edges.map(edgeName));

  const missing = [...counted].filter((name) => !declared.has(name));
  const extra = [...declared].filter((name) => !counted.has(name));

  if (missing.length > 0) {
    throw new Error(`Edges counted but not classified: ${missing.join(', ')}`);
  }

  if (extra.length > 0) {
    throw new Error(`Edges classified but not counted: ${extra.join(', ')}`);
  }
};

const backupTableFor = (table, stamp) =>
  assertSafeIdentifier(
    `purge_backup_${assertSafeIdentifier(stamp)}_${assertSafeIdentifier(table)}`,
  );

const nullifyBackupTableFor = (stamp) =>
  assertSafeIdentifier(`purge_backup_${assertSafeIdentifier(stamp)}_nullified`);

/** Empty clone of `table`, structure only -- the snapshot a delete can be undone from. */
const buildBackupTableQuery = (table, stamp) =>
  `CREATE TABLE IF NOT EXISTS "${backupTableFor(table, stamp)}" AS ` +
  `SELECT * FROM "${assertSafeIdentifier(table)}" WHERE false`;

const buildNullifyBackupTableQuery = (stamp) =>
  `CREATE TABLE IF NOT EXISTS "${nullifyBackupTableFor(stamp)}" (` +
  `table_name text NOT NULL, column_name text NOT NULL, ` +
  `row_id text NOT NULL, old_value text NOT NULL)`;

/**
 * One statement that snapshots and repairs the same bounded set of rows.
 *
 * The doomed ids are chosen once in a CTE and reused by both the INSERT and the
 * DELETE/UPDATE, so the backup and the repair can never disagree -- selecting
 * twice could see different rows under concurrent writes and would silently
 * destroy rows that were never saved.
 */
const buildPurgeBatchQuery = (edge, { stamp, limit = 500 } = {}) => {
  const [table, column, parentTable] = edge.map(assertSafeIdentifier);
  const action = actionFor(edge);
  const bounded = Number(limit);

  const doomed =
    `WITH doomed AS (` +
    `SELECT c."id" FROM "${table}" c ` +
    `LEFT JOIN "${parentTable}" p ON c."${column}" = p."id" ` +
    `WHERE c."${column}" IS NOT NULL AND p."id" IS NULL ` +
    `ORDER BY c."id" LIMIT ${bounded})`;

  if (action === DELETE) {
    return (
      `${doomed}, saved AS (` +
      `INSERT INTO "${backupTableFor(table, stamp)}" ` +
      `SELECT * FROM "${table}" WHERE "id" IN (SELECT "id" FROM doomed)) ` +
      `DELETE FROM "${table}" WHERE "id" IN (SELECT "id" FROM doomed) RETURNING "id"`
    );
  }

  return (
    `${doomed}, saved AS (` +
    `INSERT INTO "${nullifyBackupTableFor(stamp)}" (table_name, column_name, row_id, old_value) ` +
    `SELECT '${table}', '${column}', "id"::text, "${column}"::text FROM "${table}" ` +
    `WHERE "id" IN (SELECT "id" FROM doomed)) ` +
    `UPDATE "${table}" SET "${column}" = NULL ` +
    `WHERE "id" IN (SELECT "id" FROM doomed) RETURNING "id"`
  );
};

module.exports = {
  DELETE,
  NULLIFY,
  PURGE_ACTIONS,
  actionFor,
  assertPolicyCoversEdges,
  backupTableFor,
  nullifyBackupTableFor,
  buildBackupTableQuery,
  buildNullifyBackupTableQuery,
  buildPurgeBatchQuery,
};
