/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Referential-integrity census.
 *
 * The schema has NO foreign key constraints -- `grep -c 'references(' db/migrations/*`
 * is 0 across every migration, upstream included. Integrity is enforced only by
 * the `delete-related` helper cascades in `api/helpers/*`, which are not
 * transactional. When one of those cascades dies half-way it leaves a child row
 * whose FK points at a row that no longer exists, and nothing in the system ever
 * notices: no constraint fires, no log line is written, and the row sits there
 * until the client dereferences it and white-screens (see #8).
 *
 * This module is the standing monitor for that. It is a plain data description
 * plus SQL builders so it can be driven either by knex (`db/orphan-census.js`,
 * `npm run db:orphan-census`) or by a lifted Sails app (`sails.sendNativeQuery`,
 * used by `test/integration/helpers/delete-related.test.js`).
 *
 * Adding a nullable or non-nullable association to a model? Add the edge here
 * too -- `test/utils/orphan-census.test.js` fails if an edge is malformed, and
 * the integration suite fails if any edge reports orphans after a cascade.
 *
 * ---------------------------------------------------------------------------
 * WHY THERE IS NO `ADD CONSTRAINT` MIGRATION ALONGSIDE THIS
 * ---------------------------------------------------------------------------
 * The real fix for all of the above is FK constraints with ON DELETE CASCADE /
 * SET NULL, which would make an orphan unrepresentable instead of merely
 * countable. That migration is designed but deliberately NOT landed here:
 *
 *  1. Roughly 1180 orphaned rows exist in production today. `ALTER TABLE ...
 *     ADD CONSTRAINT ... FOREIGN KEY` validates existing rows and aborts on the
 *     first violation, so every one of those statements fails until the data is
 *     repaired. The repair is a set of DELETEs against a live kanban database
 *     and belongs to an operator, not to a deploy.
 *  2. Knex ordering hazard. `db/migrations` is sorted by filename and this repo
 *     is a FORK that still merges upstream. Upstream already has migrations
 *     dated later than our newest (20260807*, 20260808*). A fork-local
 *     migration timestamped today sorts AFTER those but would be APPLIED
 *     BEFORE them on our instance, so the two orderings disagree permanently.
 *     Knex 3.x does not reject that -- `validateMigrationList()` only errors
 *     when a migration recorded as completed has vanished from the directory --
 *     so it fails silently rather than loudly, which is worse. The hard failure
 *     comes later: if a fork-local migration is ever renamed or dropped during
 *     an upstream rebase after it has run in production, the next
 *     `migrate:latest` aborts with "The migration directory is corrupt".
 *     ESCAPE HATCH, when it is landed: give the file a timestamp far beyond any
 *     plausible upstream one (e.g. 20261113000000_add_referential_integrity_constraints.js) so it
 *     always sorts last, and never rename it once applied.
 *
 * Until then this census is the compensating control: it is the thing that
 * tells you the invariant has been violated.
 */

/**
 * Every FK-shaped column in the schema, as `[table, column, parentTable]`.
 * Derived from the `model:` associations in `api/models/*.js`; the parent's key
 * is always `id`. `user_account` is the table behind the `User` model.
 */
const ORPHAN_EDGES = [
  ['action', 'board_id', 'board'],
  ['action', 'card_id', 'card'],
  ['action', 'user_id', 'user_account'],
  ['attachment', 'card_id', 'card'],
  ['attachment', 'creator_user_id', 'user_account'],
  ['background_image', 'project_id', 'project'],
  ['background_image', 'uploaded_file_id', 'uploaded_file'],
  ['base_custom_field_group', 'project_id', 'project'],
  ['board', 'project_id', 'project'],
  ['board_membership', 'board_id', 'board'],
  ['board_membership', 'project_id', 'project'],
  ['board_membership', 'user_id', 'user_account'],
  ['board_subscription', 'board_id', 'board'],
  ['board_subscription', 'user_id', 'user_account'],
  ['card', 'board_id', 'board'],
  ['card', 'cover_attachment_id', 'attachment'],
  ['card', 'creator_user_id', 'user_account'],
  ['card', 'list_id', 'list'],
  ['card', 'prev_list_id', 'list'],
  ['card_label', 'card_id', 'card'],
  ['card_label', 'label_id', 'label'],
  ['card_membership', 'card_id', 'card'],
  ['card_membership', 'user_id', 'user_account'],
  ['card_subscription', 'card_id', 'card'],
  ['card_subscription', 'user_id', 'user_account'],
  ['comment', 'card_id', 'card'],
  ['comment', 'user_id', 'user_account'],
  ['custom_field', 'base_custom_field_group_id', 'base_custom_field_group'],
  ['custom_field', 'custom_field_group_id', 'custom_field_group'],
  ['custom_field_group', 'base_custom_field_group_id', 'base_custom_field_group'],
  ['custom_field_group', 'board_id', 'board'],
  ['custom_field_group', 'card_id', 'card'],
  ['custom_field_value', 'card_id', 'card'],
  ['custom_field_value', 'custom_field_group_id', 'custom_field_group'],
  ['custom_field_value', 'custom_field_id', 'custom_field'],
  ['label', 'board_id', 'board'],
  ['list', 'board_id', 'board'],
  ['notification', 'action_id', 'action'],
  ['notification', 'board_id', 'board'],
  ['notification', 'card_id', 'card'],
  ['notification', 'comment_id', 'comment'],
  ['notification', 'creator_user_id', 'user_account'],
  ['notification', 'user_id', 'user_account'],
  ['notification_service', 'board_id', 'board'],
  ['notification_service', 'user_id', 'user_account'],
  ['project', 'background_image_id', 'background_image'],
  ['project', 'owner_project_manager_id', 'project_manager'],
  ['project_favorite', 'project_id', 'project'],
  ['project_favorite', 'user_id', 'user_account'],
  ['project_manager', 'project_id', 'project'],
  ['project_manager', 'user_id', 'user_account'],
  ['session', 'user_id', 'user_account'],
  ['task', 'assignee_user_id', 'user_account'],
  ['task', 'linked_card_id', 'card'],
  ['task', 'task_list_id', 'task_list'],
  ['task_list', 'card_id', 'card'],
  ['webhook', 'board_id', 'board'],
];

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]*$/;

const edgeName = ([table, column]) => `${table}.${column}`;

const assertSafeIdentifier = (value) => {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Unsafe SQL identifier in orphan census: ${value}`);
  }

  return value;
};

/**
 * Rows in `table` whose `column` is set but points at a `parentTable` row that
 * does not exist. Identifiers are interpolated (they cannot be bound), so they
 * are validated against a strict allowlist pattern first.
 */
const buildCountQuery = (edge) => {
  const [table, column, parentTable] = edge.map(assertSafeIdentifier);

  return (
    `SELECT COUNT(*)::int AS total FROM "${table}" c ` +
    `LEFT JOIN "${parentTable}" p ON c."${column}" = p."id" ` +
    `WHERE c."${column}" IS NOT NULL AND p."id" IS NULL`
  );
};

/**
 * The same rows, as ids, for an operator writing repair statements.
 */
const buildSelectQuery = (edge, { limit = 100 } = {}) => {
  const [table, column, parentTable] = edge.map(assertSafeIdentifier);

  return (
    `SELECT c."id", c."${column}" FROM "${table}" c ` +
    `LEFT JOIN "${parentTable}" p ON c."${column}" = p."id" ` +
    `WHERE c."${column}" IS NOT NULL AND p."id" IS NULL ` +
    `ORDER BY c."id" LIMIT ${Number(limit)}`
  );
};

/**
 * One `UNION ALL` statement covering every edge, so a census is a single round
 * trip. Returns rows of `{ edge, total }`, including the zero rows -- a missing
 * edge in the output is a bug, not a clean edge.
 */
const buildCensusQuery = (edges = ORPHAN_EDGES) =>
  edges
    .map((edge) => {
      const [table, column, parentTable] = edge.map(assertSafeIdentifier);

      return (
        `SELECT '${table}.${column}' AS edge, COUNT(*)::int AS total ` +
        `FROM "${table}" c LEFT JOIN "${parentTable}" p ON c."${column}" = p."id" ` +
        `WHERE c."${column}" IS NOT NULL AND p."id" IS NULL`
      );
    })
    .join(' UNION ALL ');

/**
 * `rows` as returned by the census query -> `{ 'table.column': total }` for
 * every edge, plus the grand total. Keeps zero-count edges so callers can
 * assert on completeness.
 */
const summarize = (rows) => {
  const totalsByEdge = rows.reduce(
    (result, row) => ({
      ...result,
      [row.edge]: Number(row.total),
    }),
    {},
  );

  const orphanedEdges = Object.entries(totalsByEdge)
    .filter(([, total]) => total > 0)
    .sort(([, a], [, b]) => b - a);

  return {
    totalsByEdge,
    orphanedEdges,
    total: orphanedEdges.reduce((sum, [, count]) => sum + count, 0),
  };
};

module.exports = {
  ORPHAN_EDGES,
  edgeName,
  buildCountQuery,
  buildSelectQuery,
  buildCensusQuery,
  summarize,
};
