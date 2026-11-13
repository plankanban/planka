/**
 * Cascade-ordering regression suite.
 *
 * The `delete-related` helpers used to destroy the PARENT row first and recurse
 * into its children second. There are no transactions anywhere in the
 * application layer, so any throw, pod restart or statement timeout in between
 * left the children behind with a foreign key pointing at a row that no longer
 * existed. No constraint caught it -- the schema has none -- and the client
 * eventually dereferenced one of those rows and white-screened (#8).
 *
 * Each test here injects exactly that failure: it replaces the recursive
 * `deleteRelated` step with a thrower, which is the same observable event as
 * the process dying between the two statements, and then runs the full orphan
 * census. On the pre-fix tree the parent is already gone by then and the census
 * is non-zero; on the fixed tree nothing has been deleted yet and it is zero.
 *
 * Requires a real Postgres. Set TEST_DATABASE_URL to a throwaway database --
 * these tests TRUNCATE every table. Without it the suite skips itself.
 *
 *   docker run -d --name planka-test-pg -p 127.0.0.1:5454:5432 \
 *     -e POSTGRES_PASSWORD=planka -e POSTGRES_USER=planka \
 *     -e POSTGRES_DB=planka_test postgres:18-alpine
 *   DATABASE_URL=postgresql://planka:planka@127.0.0.1:5454/planka_test npm run db:migrate
 *   TEST_DATABASE_URL=postgresql://planka:planka@127.0.0.1:5454/planka_test npm test
 */

const { expect } = require('chai');

const { buildCensusQuery, summarize, ORPHAN_EDGES } = require('../../../utils/orphan-census');
const { withoutForeignKeys } = require('../../support/foreign-keys');

const { TEST_DATABASE_URL } = process.env;

const TABLES = [
  ...new Set(ORPHAN_EDGES.flatMap(([table, , parentTable]) => [table, parentTable])),
].sort();

const INJECTED = 'injected mid-cascade failure';

/* Fixture */

let sequence = 0;

const nextSuffix = () => {
  sequence += 1;
  return sequence;
};

const truncateAll = async () => {
  // Belt and braces: config/env/test.js only wires Postgres when
  // TEST_DATABASE_URL is set, but this statement is destructive enough to
  // deserve its own guard.
  if (!TEST_DATABASE_URL) {
    throw new Error('refusing to truncate without TEST_DATABASE_URL');
  }

  await sails.sendNativeQuery(
    `TRUNCATE TABLE ${TABLES.map((table) => `"${table}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
};

const census = async () => {
  const { rows } = await sails.sendNativeQuery(buildCensusQuery());

  return summarize(rows);
};

const countRows = async (table) => {
  const { rows } = await sails.sendNativeQuery(`SELECT COUNT(*)::int AS total FROM "${table}"`);

  return rows[0].total;
};

/**
 * A complete project subtree, deliberately touching every edge the cascades
 * are supposed to clean: two users (so the #8 "other manager's row" case is
 * reachable), a board with both a board-scoped and a card-scoped custom field
 * group, labels, task lists, tasks, a link attachment, a comment, an action and
 * a notification pointing at all three.
 */
const buildTree = async () => {
  const suffix = nextSuffix();

  const owner = await User.create({
    email: `owner-${suffix}@test.test`,
    role: User.Roles.ADMIN,
    name: `Owner ${suffix}`,
  }).fetch();

  const member = await User.create({
    email: `member-${suffix}@test.test`,
    role: User.Roles.BOARD_USER,
    name: `Member ${suffix}`,
  }).fetch();

  const project = await Project.create({ name: `Project ${suffix}` }).fetch();

  const ownerProjectManager = await ProjectManager.create({
    projectId: project.id,
    userId: owner.id,
  }).fetch();

  // The row that white-screened production: a SECOND manager on a project owned
  // by somebody else. Deleting the owner must not leave this behind.
  const memberProjectManager = await ProjectManager.create({
    projectId: project.id,
    userId: member.id,
  }).fetch();

  await Project.updateOne(project.id).set({
    ownerProjectManagerId: ownerProjectManager.id,
  });

  await ProjectFavorite.create({ projectId: project.id, userId: owner.id }).fetch();

  const baseCustomFieldGroup = await BaseCustomFieldGroup.create({
    projectId: project.id,
    name: `Base group ${suffix}`,
  }).fetch();

  const board = await Board.create({
    projectId: project.id,
    position: 65536,
    name: `Board ${suffix}`,
  }).fetch();

  await BoardMembership.create({
    projectId: project.id,
    boardId: board.id,
    userId: owner.id,
    role: BoardMembership.Roles.EDITOR,
  }).fetch();

  const memberBoardMembership = await BoardMembership.create({
    projectId: project.id,
    boardId: board.id,
    userId: member.id,
    role: BoardMembership.Roles.VIEWER,
  }).fetch();

  await BoardSubscription.create({ boardId: board.id, userId: owner.id }).fetch();

  await NotificationService.create({
    boardId: board.id,
    url: 'https://example.test/hook',
    format: NotificationService.Formats.TEXT,
  }).fetch();

  const label = await Label.create({
    boardId: board.id,
    position: 65536,
    color: 'berry-red',
  }).fetch();

  const list = await List.create({
    boardId: board.id,
    type: List.Types.ACTIVE,
    position: 65536,
    name: `List ${suffix}`,
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
    assigneeUserId: owner.id,
  }).fetch();

  // `link`, not `file`: a file attachment would drag the uploaded-file
  // reference counter and the file manager into the test.
  await Attachment.create({
    cardId: card.id,
    type: Attachment.Types.LINK,
    data: { url: 'https://example.test/thing' },
    name: `Attachment ${suffix}`,
    creatorUserId: owner.id,
  }).fetch();

  // Board-scoped: never deleted at all before this change, and the single
  // biggest orphan source in production (1118 rows).
  const boardCustomFieldGroup = await CustomFieldGroup.create({
    boardId: board.id,
    baseCustomFieldGroupId: baseCustomFieldGroup.id,
    position: 65536,
    name: `Board group ${suffix}`,
  }).fetch();

  const cardCustomFieldGroup = await CustomFieldGroup.create({
    cardId: card.id,
    position: 65536,
    name: `Card group ${suffix}`,
  }).fetch();

  const boardCustomField = await CustomField.create({
    customFieldGroupId: boardCustomFieldGroup.id,
    position: 65536,
    name: `Board field ${suffix}`,
  }).fetch();

  const cardCustomField = await CustomField.create({
    customFieldGroupId: cardCustomFieldGroup.id,
    position: 65536,
    name: `Card field ${suffix}`,
  }).fetch();

  await CustomField.create({
    baseCustomFieldGroupId: baseCustomFieldGroup.id,
    position: 65536,
    name: `Base field ${suffix}`,
  }).fetch();

  await CustomFieldValue.create({
    cardId: card.id,
    customFieldGroupId: boardCustomFieldGroup.id,
    customFieldId: boardCustomField.id,
    content: 'board value',
  }).fetch();

  await CustomFieldValue.create({
    cardId: card.id,
    customFieldGroupId: cardCustomFieldGroup.id,
    customFieldId: cardCustomField.id,
    content: 'card value',
  }).fetch();

  const comment = await Comment.create({
    cardId: card.id,
    userId: owner.id,
    text: `Comment ${suffix}`,
  }).fetch();

  const action = await Action.create({
    cardId: card.id,
    boardId: board.id,
    userId: owner.id,
    type: Action.Types.CREATE_CARD,
    data: {},
  }).fetch();

  await Notification.create({
    userId: member.id,
    creatorUserId: owner.id,
    boardId: board.id,
    cardId: card.id,
    commentId: comment.id,
    type: Notification.Types.COMMENT_CARD,
    data: { card: { name: card.name } },
  }).fetch();

  await Notification.create({
    userId: member.id,
    creatorUserId: owner.id,
    boardId: board.id,
    cardId: card.id,
    actionId: action.id,
    type: Notification.Types.MOVE_CARD,
    data: { card: { name: card.name } },
  }).fetch();

  await Webhook.create({
    boardId: board.id,
    name: `Webhook ${suffix}`,
    url: 'https://example.test/webhook',
  }).fetch();

  return {
    owner,
    member,
    project,
    ownerProjectManager,
    memberProjectManager,
    memberBoardMembership,
    baseCustomFieldGroup,
    board,
    label,
    list,
    card,
    taskList,
    comment,
    action,
    boardCustomFieldGroup,
    cardCustomFieldGroup,
  };
};

/* Mid-cascade failure injection */

const restorers = [];

/**
 * Replaces the recursive child step with a thrower. This is the same observable
 * event as the process dying between the parent delete and the child delete:
 * the parent statement has run (or not, once the ordering is fixed) and the
 * child statement never will.
 */
const breakCascadeAt = (namespace, method) => {
  const original = sails.helpers[namespace][method];
  const state = { called: 0 };

  sails.helpers[namespace][method] = () => {
    state.called += 1;
    return Promise.reject(new Error(INJECTED));
  };

  restorers.push(() => {
    sails.helpers[namespace][method] = original;
  });

  return state;
};

const expectInjectedFailure = async (promise) => {
  let error;

  try {
    await promise;
  } catch (thrown) {
    error = thrown;
  }

  // Sails wraps a rejecting helper in its own `OperationalError`, which is not
  // an `Error` as far as chai's type detection is concerned -- so assert on the
  // message, which is preserved.
  expect(error, 'the cascade should have propagated the injected failure').to.not.equal(undefined);
  expect(String(error.message)).to.contain(INJECTED);
};

/* Suite */

(TEST_DATABASE_URL ? describe : describe.skip)('delete-related cascade ordering', () => {
  let tree;

  // MUST come before the FK migration can help these tests. Every assertion below
  // is `census === 0`, and with foreign keys enforced Postgres delivers that on its
  // own -- ON DELETE CASCADE would clean up after a parent-first regression and the
  // suite would stay green through the exact bug it was written to catch. Disabling
  // enforcement keeps the subject of the test the APPLICATION cascade.
  // See test/support/foreign-keys.js.
  withoutForeignKeys();

  beforeEach(async () => {
    await truncateAll();
    tree = await buildTree();
  });

  afterEach(() => {
    while (restorers.length > 0) {
      restorers.pop()();
    }
  });

  describe('the fixture itself', () => {
    it('starts clean', async () => {
      const { total, orphanedEdges } = await census();

      expect(orphanedEdges).to.eql([]);
      expect(total).to.equal(0);
    });
  });

  describe('when the cascade dies mid-fan-out', () => {
    it('cards -> task lists leaves no orphans', async () => {
      const injection = breakCascadeAt('taskLists', 'deleteRelated');

      await expectInjectedFailure(sails.helpers.cards.deleteRelated(tree.card));

      expect(injection.called).to.equal(1);

      const { total, orphanedEdges } = await census();

      expect(orphanedEdges, JSON.stringify(orphanedEdges)).to.eql([]);
      expect(total).to.equal(0);
    });

    it('lists -> cards leaves no orphans', async () => {
      const injection = breakCascadeAt('cards', 'deleteRelated');

      await expectInjectedFailure(sails.helpers.lists.deleteRelated(tree.list));

      expect(injection.called).to.equal(1);

      const { total, orphanedEdges } = await census();

      expect(orphanedEdges, JSON.stringify(orphanedEdges)).to.eql([]);
      expect(total).to.equal(0);

      // and the subtree is still there to be re-deleted, rather than stranded
      expect(await countRows('card')).to.equal(1);
      expect(await countRows('task_list')).to.equal(1);
    });

    it('boards -> lists leaves no orphans', async () => {
      const injection = breakCascadeAt('lists', 'deleteRelated');

      await expectInjectedFailure(sails.helpers.boards.deleteRelated(tree.board));

      expect(injection.called).to.equal(1);

      const { total, orphanedEdges } = await census();

      expect(orphanedEdges, JSON.stringify(orphanedEdges)).to.eql([]);
      expect(total).to.equal(0);
    });

    it('projects -> boards leaves no orphans', async () => {
      const injection = breakCascadeAt('boards', 'deleteRelated');

      await expectInjectedFailure(sails.helpers.projects.deleteRelated(tree.project));

      expect(injection.called).to.equal(1);

      const { total, orphanedEdges } = await census();

      expect(orphanedEdges, JSON.stringify(orphanedEdges)).to.eql([]);
      expect(total).to.equal(0);
    });

    it('users -> projects leaves no orphaned project managers (regression for #8)', async () => {
      const injection = breakCascadeAt('projects', 'deleteRelated');

      await expectInjectedFailure(sails.helpers.users.deleteRelated(tree.owner));

      expect(injection.called).to.equal(1);

      const { total, totalsByEdge, orphanedEdges } = await census();

      expect(totalsByEdge['project_manager.project_id']).to.equal(0);
      expect(totalsByEdge['project.owner_project_manager_id']).to.equal(0);
      expect(orphanedEdges, JSON.stringify(orphanedEdges)).to.eql([]);
      expect(total).to.equal(0);
    });

    it('base custom field groups -> custom field groups leaves no orphans', async () => {
      const injection = breakCascadeAt('customFieldGroups', 'deleteRelated');

      await expectInjectedFailure(
        sails.helpers.baseCustomFieldGroups.deleteRelated(tree.baseCustomFieldGroup),
      );

      expect(injection.called).to.equal(1);

      const { total, orphanedEdges } = await census();

      expect(orphanedEdges, JSON.stringify(orphanedEdges)).to.eql([]);
      expect(total).to.equal(0);
    });
  });

  describe('the fetch that replaced the parent delete', () => {
    it('returns every card, not a page of them', async () => {
      // `Card.qm` defines `LIMIT = 50` for the endless-list query and its
      // `defaultFind` calls `.limit(limit)` with `limit` undefined. If that
      // ever resolved to a default page size, `lists.deleteRelated` would
      // silently skip the children of every card past the first page -- the
      // exact orphan bug this change exists to remove, reintroduced quietly.
      const extra = 60;

      await Card.createEach(
        Array.from({ length: extra }, (unused, index) => ({
          boardId: tree.board.id,
          listId: tree.list.id,
          type: Card.Types.PROJECT,
          position: 65536 + index + 1,
          name: `Bulk card ${index}`,
        })),
      ).fetch();

      const cards = await Card.qm.getByListIds(tree.list.id);

      expect(cards).to.have.lengthOf(extra + 1);
    });

    it('deletes the children of every card in a list bigger than one page', async () => {
      const extra = 60;

      const cards = await Card.createEach(
        Array.from({ length: extra }, (unused, index) => ({
          boardId: tree.board.id,
          listId: tree.list.id,
          type: Card.Types.PROJECT,
          position: 65536 + index + 1,
          name: `Bulk card ${index}`,
        })),
      ).fetch();

      await TaskList.createEach(
        cards.map((card, index) => ({
          cardId: card.id,
          position: 65536,
          name: `Bulk task list ${index}`,
        })),
      ).fetch();

      expect(await countRows('task_list')).to.equal(extra + 1);

      await sails.helpers.lists.deleteRelated(tree.list);

      expect(await countRows('task_list')).to.equal(0);
      expect(await countRows('card')).to.equal(0);
      expect((await census()).total).to.equal(0);
    });
  });

  describe('when the cascade completes', () => {
    it('projects.deleteRelated empties the whole subtree', async () => {
      await sails.helpers.projects.deleteRelated(tree.project);
      await Project.qm.deleteOne(tree.project.id);

      const { total, orphanedEdges } = await census();

      expect(orphanedEdges, JSON.stringify(orphanedEdges)).to.eql([]);
      expect(total).to.equal(0);

      // `user_account` outlives the project by design; `webhook` survives too
      // but is detached rather than deleted (see boards/delete-related.js).
      const remaining = await Promise.all(
        TABLES.filter((table) => !['user_account', 'webhook'].includes(table)).map(
          async (table) => [table, await countRows(table)],
        ),
      );

      expect(remaining.filter(([, count]) => count > 0)).to.eql([]);
    });

    it('detaches board-scoped webhooks instead of deleting them', async () => {
      await sails.helpers.projects.deleteRelated(tree.project);
      await Project.qm.deleteOne(tree.project.id);

      const webhooks = await Webhook.qm.getAll();

      expect(webhooks).to.have.lengthOf(1);
      expect(webhooks[0].boardId).to.equal(null);
      expect((await census()).totalsByEdge['webhook.board_id']).to.equal(0);
    });

    it('deletes board-scoped custom field groups, which nothing used to delete', async () => {
      expect(await countRows('custom_field_group')).to.equal(2);

      await sails.helpers.boards.deleteRelated(tree.board);
      await Board.qm.deleteOne(tree.board.id);

      expect(await countRows('custom_field_group')).to.equal(0);
      expect((await census()).total).to.equal(0);
    });

    it('deletes board subscriptions and notifications with the board', async () => {
      expect(await countRows('board_subscription')).to.equal(1);
      expect(await countRows('notification')).to.equal(2);

      await sails.helpers.boards.deleteRelated(tree.board);
      await Board.qm.deleteOne(tree.board.id);

      expect(await countRows('board_subscription')).to.equal(0);
      expect(await countRows('notification')).to.equal(0);
    });

    it('deletes board subscriptions with the user', async () => {
      expect(await countRows('board_subscription')).to.equal(1);

      await sails.helpers.users.deleteRelated(tree.owner);
      await User.qm.deleteOne(tree.owner.id);

      expect(await countRows('board_subscription')).to.equal(0);
      expect((await census()).total).to.equal(0);
    });

    it('still returns the deleted owner’s project managers to its caller', async () => {
      // `users/delete-one.js` feeds these straight into `getLonelyByIds()` and
      // into the socket scoper, so the shape has to survive the reordering.
      const { projectManagers, boardMemberships } = await sails.helpers.users.deleteRelated(
        tree.owner,
      );

      expect(projectManagers.map(({ id }) => id)).to.eql([tree.ownerProjectManager.id]);

      // Empty, both before and after this change: the owner's own board went
      // with their project, and the board cascade removes memberships by board
      // before the user cascade gets to remove them by user.
      expect(boardMemberships).to.eql([]);
    });

    it('still returns a non-owner’s project managers and board memberships', async () => {
      const { projectManagers, boardMemberships } = await sails.helpers.users.deleteRelated(
        tree.member,
      );

      expect(projectManagers.map(({ id }) => id)).to.eql([tree.memberProjectManager.id]);
      expect(boardMemberships.map(({ id }) => id)).to.eql([tree.memberBoardMembership.id]);
      expect((await census()).total).to.equal(0);
    });

    it('still returns the deleted board’s memberships to its caller', async () => {
      const { boardMemberships } = await sails.helpers.boards.deleteRelated(tree.board);

      expect(boardMemberships).to.have.lengthOf(2);
      boardMemberships.forEach((boardMembership) => {
        expect(boardMembership.boardId).to.equal(tree.board.id);
      });
    });

    it('still returns the deleted project’s managers to its caller', async () => {
      const { projectManagers } = await sails.helpers.projects.deleteRelated(tree.project);

      expect(projectManagers.map(({ id }) => id).sort()).to.eql(
        [tree.ownerProjectManager.id, tree.memberProjectManager.id].sort(),
      );
    });
  });

  describe('query methods on an already-deleted row', () => {
    it('Comment.qm.deleteOne resolves instead of throwing', async () => {
      const first = await Comment.qm.deleteOne(tree.comment.id);
      expect(first.id).to.equal(tree.comment.id);

      const second = await Comment.qm.deleteOne(tree.comment.id);
      expect(second).to.equal(undefined);
    });

    it('Attachment.qm.deleteOne resolves instead of throwing', async () => {
      const attachment = await Attachment.qm.getByCardId(tree.card.id);

      const first = await Attachment.qm.deleteOne(attachment[0].id);
      expect(first.attachment.id).to.equal(attachment[0].id);

      const second = await Attachment.qm.deleteOne(attachment[0].id);
      expect(second.attachment).to.equal(undefined);
      expect(second.uploadedFile).to.equal(undefined);
    });
  });
});
