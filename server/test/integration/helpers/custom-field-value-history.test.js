/**
 * A custom field holds one value per (card, field), so every overwrite used to
 * lose the previous value. For tracked fields (`block_reason` by default, see
 * sails.config.custom.trackedCustomFieldNames) each real change now leaves an
 * `updateCustomFieldValue` card action, which is the history returned by
 * GET /api/cards/:id/actions.
 *
 * Drives the real helper against a real Postgres (the value upsert is a native
 * query). Requires TEST_DATABASE_URL; skips itself without it. Fixtures are
 * unique per test and nothing is truncated.
 */

const { expect } = require('chai');

const { TEST_DATABASE_URL } = process.env;

let sequence = 0;

const buildFixture = async (customFieldName) => {
  sequence += 1;
  const suffix = `${Date.now()}-${sequence}`;

  const user = await User.create({
    email: `cfv-history-${suffix}@test.test`,
    role: User.Roles.ADMIN,
    name: `User ${suffix}`,
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

  const card = await Card.create({
    boardId: board.id,
    listId: list.id,
    type: Card.Types.PROJECT,
    position: 65536,
    name: `Card ${suffix}`,
    creatorUserId: user.id,
  }).fetch();

  const customFieldGroup = await CustomFieldGroup.create({
    boardId: board.id,
    position: 65536,
    name: `Group ${suffix}`,
  }).fetch();

  const customField = await CustomField.create({
    customFieldGroupId: customFieldGroup.id,
    position: 65536,
    name: customFieldName,
  }).fetch();

  return { user, project, board, list, card, customFieldGroup, customField };
};

const setValue = (fixture, content) =>
  sails.helpers.customFieldValues.createOrUpdateOne.with({
    project: fixture.project,
    board: fixture.board,
    list: fixture.list,
    values: {
      content,
      card: fixture.card,
      customFieldGroup: fixture.customFieldGroup,
      customField: fixture.customField,
    },
    actorUser: fixture.user,
  });

const getHistoryActions = (fixture) =>
  Action.find({
    cardId: fixture.card.id,
    type: Action.Types.UPDATE_CUSTOM_FIELD_VALUE,
  }).sort('id');

(TEST_DATABASE_URL ? describe : describe.skip)('custom field value history', () => {
  let originalTrackedNames;

  before(() => {
    originalTrackedNames = sails.config.custom.trackedCustomFieldNames;
    sails.config.custom.trackedCustomFieldNames = ['block_reason'];
  });

  after(() => {
    sails.config.custom.trackedCustomFieldNames = originalTrackedNames;
  });

  it('records one action with the content when a tracked field gets a new value', async () => {
    const fixture = await buildFixture('block_reason');

    await setValue(fixture, 'waiting on CI');

    const actions = await getHistoryActions(fixture);

    expect(actions).to.have.length(1);
    expect(actions[0].userId).to.equal(fixture.user.id);
    expect(actions[0].boardId).to.equal(fixture.board.id);
    expect(actions[0].data).to.include({
      customFieldId: fixture.customField.id,
      customFieldName: 'block_reason',
      customFieldGroupId: fixture.customFieldGroup.id,
      customFieldGroupName: fixture.customFieldGroup.name,
      content: 'waiting on CI',
    });
  });

  it('keeps every distinct reason and skips an unchanged value', async () => {
    const fixture = await buildFixture('block_reason');

    await setValue(fixture, 'first reason');
    await setValue(fixture, 'first reason');
    await setValue(fixture, 'second reason');

    const actions = await getHistoryActions(fixture);

    expect(actions.map((action) => action.data.content)).to.eql(['first reason', 'second reason']);
  });

  it('records nothing for an empty value', async () => {
    const fixture = await buildFixture('block_reason');

    await setValue(fixture, '   ');

    expect(await getHistoryActions(fixture)).to.have.length(0);
  });

  it('records nothing for an untracked field', async () => {
    const fixture = await buildFixture('estimate');

    await setValue(fixture, 'three days');

    expect(await getHistoryActions(fixture)).to.have.length(0);
  });
});
