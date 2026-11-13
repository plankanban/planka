/**
 * Purge repair suite.
 *
 * `utils/orphan-purge` decides what to do with a row whose parent is gone, and
 * `db/orphan-purge.js` drives it. The unit tests assert the SQL's SHAPE; nothing
 * there proves the statements actually run, that the snapshot really captures the
 * rows before they are destroyed, or -- the dangerous one -- that a `nullify`
 * edge leaves its row standing. This suite runs the real statements against a
 * real Postgres.
 *
 * Orphans are manufactured the way production made them: the parent row is
 * removed with raw SQL, bypassing the application cascade entirely, which is the
 * same end state as a cascade that died half-way.
 *
 * Requires a real Postgres. Set TEST_DATABASE_URL to a throwaway database --
 * these tests TRUNCATE every table. Without it the suite skips itself.
 */

const { expect } = require('chai');

const {
  ORPHAN_EDGES,
  buildCensusQuery,
  summarize,
  edgeName,
} = require('../../../utils/orphan-census');
const {
  buildBackupTableQuery,
  buildNullifyBackupTableQuery,
  buildPurgeBatchQuery,
  backupTableFor,
  nullifyBackupTableFor,
} = require('../../../utils/orphan-purge');

const { TEST_DATABASE_URL } = process.env;

const TABLES = [
  ...new Set(ORPHAN_EDGES.flatMap(([table, , parentTable]) => [table, parentTable])),
].sort();

const STAMP = 'tpurge';

let sequence = 0;

const nextSuffix = () => {
  sequence += 1;
  return sequence;
};

const truncateAll = async () => {
  if (!TEST_DATABASE_URL) {
    throw new Error('refusing to truncate without TEST_DATABASE_URL');
  }

  await sails.sendNativeQuery(
    `TRUNCATE TABLE ${TABLES.map((table) => `"${table}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
};

const dropBackupTables = async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const table of TABLES) {
    // eslint-disable-next-line no-await-in-loop
    await sails.sendNativeQuery(`DROP TABLE IF EXISTS "${backupTableFor(table, STAMP)}"`);
  }

  await sails.sendNativeQuery(`DROP TABLE IF EXISTS "${nullifyBackupTableFor(STAMP)}"`);
};

const prepareBackupTables = async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const table of TABLES) {
    // eslint-disable-next-line no-await-in-loop
    await sails.sendNativeQuery(buildBackupTableQuery(table, STAMP));
  }

  await sails.sendNativeQuery(buildNullifyBackupTableQuery(STAMP));
};

const census = async () => {
  const { rows } = await sails.sendNativeQuery(buildCensusQuery());

  return summarize(rows);
};

const countRows = async (table) => {
  const { rows } = await sails.sendNativeQuery(`SELECT COUNT(*)::int AS total FROM "${table}"`);

  return rows[0].total;
};

/** Drives the same convergence loop as the runner, over the same builders. */
const purgeToFixedPoint = async ({ maxPasses = 10 } = {}) => {
  const passes = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const pass of Array.from({ length: maxPasses }, (_, index) => index + 1)) {
    // eslint-disable-next-line no-await-in-loop
    const before = await census();

    if (before.total === 0) {
      break;
    }

    let repaired = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const [name] of before.orphanedEdges) {
      const edge = ORPHAN_EDGES.find((candidate) => edgeName(candidate) === name);

      // eslint-disable-next-line no-await-in-loop
      const { rows } = await sails.sendNativeQuery(
        buildPurgeBatchQuery(edge, { stamp: STAMP, limit: 500 }),
      );

      repaired += rows.length;
    }

    passes.push({ pass, repaired });
  }

  return passes;
};

/** A card with one of every child the census watches. */
const buildCard = async () => {
  const suffix = nextSuffix();

  const owner = await User.create({
    email: `purge-owner-${suffix}@test.test`,
    role: User.Roles.ADMIN,
    name: `Owner ${suffix}`,
  }).fetch();

  const project = await Project.create({ name: `Project ${suffix}` }).fetch();
  const board = await Board.create({
    projectId: project.id,
    position: 65536,
    name: `Board ${suffix}`,
  }).fetch();
  const list = await List.create({
    boardId: board.id,
    type: List.Types.ACTIVE,
    position: 65536,
    name: `List ${suffix}`,
  }).fetch();
  const label = await Label.create({
    boardId: board.id,
    position: 65536,
    color: 'berry-red',
  }).fetch();

  const card = await Card.create({
    boardId: board.id,
    listId: list.id,
    type: Card.Types.PROJECT,
    position: 65536,
    name: `Card ${suffix}`,
    creatorUserId: owner.id,
  }).fetch();

  await CardLabel.create({ cardId: card.id, labelId: label.id }).fetch();
  await CardMembership.create({ cardId: card.id, userId: owner.id }).fetch();
  await CardSubscription.create({ cardId: card.id, userId: owner.id }).fetch();

  const taskList = await TaskList.create({
    cardId: card.id,
    position: 65536,
    name: `Task list ${suffix}`,
  }).fetch();

  await Task.create({
    taskListId: taskList.id,
    position: 65536,
    name: `Task ${suffix}`,
  }).fetch();

  await Comment.create({ cardId: card.id, userId: owner.id, text: `Comment ${suffix}` }).fetch();

  // The board-scoped group is the production case: it outlives the card, so the
  // VALUE is the row that gets stranded.
  const boardCustomFieldGroup = await CustomFieldGroup.create({
    boardId: board.id,
    position: 65536,
    name: `Board group ${suffix}`,
  }).fetch();

  const boardCustomField = await CustomField.create({
    customFieldGroupId: boardCustomFieldGroup.id,
    position: 65536,
    name: `Board field ${suffix}`,
  }).fetch();

  await CustomFieldValue.create({
    cardId: card.id,
    customFieldGroupId: boardCustomFieldGroup.id,
    customFieldId: boardCustomField.id,
    content: 'board value',
  }).fetch();

  return { owner, project, board, list, card };
};

describe('orphan purge', function purgeSuite() {
  this.timeout(30000);

  if (!TEST_DATABASE_URL) {
    it('skipped -- set TEST_DATABASE_URL to a throwaway Postgres to run these');

    return;
  }

  beforeEach(async () => {
    await truncateAll();
    await dropBackupTables();
    await prepareBackupTables();
  });

  after(async () => {
    await dropBackupTables();
  });

  it('starts from a database the census calls clean', async () => {
    await buildCard();

    expect((await census()).total).to.equal(0);
  });

  describe('a cascade that died half-way', () => {
    it('leaves orphans the census can see (red before green)', async () => {
      const { card } = await buildCard();

      await sails.sendNativeQuery('DELETE FROM "card" WHERE "id" = $1', [card.id]);

      const { total, orphanedEdges } = await census();
      const names = orphanedEdges.map(([name]) => name);

      expect(total).to.be.above(0);
      expect(names).to.include.members([
        'card_label.card_id',
        'card_membership.card_id',
        'card_subscription.card_id',
        'comment.card_id',
        'custom_field_value.card_id',
        'task_list.card_id',
      ]);
    });

    it('purges every one of them, and converges', async () => {
      const { card } = await buildCard();

      await sails.sendNativeQuery('DELETE FROM "card" WHERE "id" = $1', [card.id]);

      const passes = await purgeToFixedPoint();

      expect((await census()).total).to.equal(0);
      expect(passes.length).to.be.below(10, 'purge did not converge');
    });

    it('needs a second pass for children exposed by the first', async () => {
      // Removing the BOARD strands the board-scoped custom field group; deleting
      // that group in pass one is what strands its custom_field rows. A
      // single-pass purge would leave them behind and call itself done.
      const { board } = await buildCard();

      await sails.sendNativeQuery('DELETE FROM "board" WHERE "id" = $1', [board.id]);

      const passes = await purgeToFixedPoint();

      expect(passes.length).to.be.above(1, 'expected a cascade requiring more than one pass');
      expect((await census()).total).to.equal(0);
    });

    it('snapshots what it destroys, before destroying it', async () => {
      const { card } = await buildCard();

      await sails.sendNativeQuery('DELETE FROM "card" WHERE "id" = $1', [card.id]);

      const strandedComments = await countRows('comment');

      await purgeToFixedPoint();

      expect(await countRows('comment')).to.equal(0);
      expect(await countRows(backupTableFor('comment', STAMP))).to.equal(strandedComments);
    });
  });

  describe('a missing decoration', () => {
    it('nullifies the reference and KEEPS the row', async () => {
      // The catastrophic misreading this policy exists to prevent: the author of
      // a card is deleted, and the repair takes the card with it.
      const { card, owner } = await buildCard();

      await sails.sendNativeQuery('DELETE FROM "comment" WHERE "user_id" = $1', [owner.id]);
      await sails.sendNativeQuery('DELETE FROM "card_membership" WHERE "user_id" = $1', [owner.id]);
      await sails.sendNativeQuery('DELETE FROM "card_subscription" WHERE "user_id" = $1', [
        owner.id,
      ]);
      await sails.sendNativeQuery('DELETE FROM "user_account" WHERE "id" = $1', [owner.id]);

      expect((await census()).totalsByEdge['card.creator_user_id']).to.equal(1);

      await purgeToFixedPoint();

      expect((await census()).total).to.equal(0);

      const { rows } = await sails.sendNativeQuery(
        'SELECT "id", "creator_user_id" FROM "card" WHERE "id" = $1',
        [card.id],
      );

      expect(rows).to.have.lengthOf(1, 'the card must survive its author');
      expect(rows[0].creator_user_id).to.equal(null);
    });

    it('records the old value so the nullify can be undone', async () => {
      const { card, owner } = await buildCard();

      await sails.sendNativeQuery('DELETE FROM "comment" WHERE "user_id" = $1', [owner.id]);
      await sails.sendNativeQuery('DELETE FROM "card_membership" WHERE "user_id" = $1', [owner.id]);
      await sails.sendNativeQuery('DELETE FROM "card_subscription" WHERE "user_id" = $1', [
        owner.id,
      ]);
      await sails.sendNativeQuery('DELETE FROM "user_account" WHERE "id" = $1', [owner.id]);

      await purgeToFixedPoint();

      const { rows } = await sails.sendNativeQuery(
        `SELECT * FROM "${nullifyBackupTableFor(STAMP)}" WHERE table_name = 'card'`,
      );

      expect(rows).to.have.lengthOf(1);
      expect(rows[0].column_name).to.equal('creator_user_id');
      expect(rows[0].row_id).to.equal(String(card.id));
      expect(rows[0].old_value).to.equal(String(owner.id));
    });
  });
});
