const { expect } = require('chai');

describe('Card label filters', () => {
  let originalSendNativeQuery;
  let nativeQueryCalls;

  beforeEach(() => {
    nativeQueryCalls = [];
    originalSendNativeQuery = sails.sendNativeQuery;

    sails.sendNativeQuery = async (query, values) => {
      nativeQueryCalls.push({ query, values });

      return {
        rows: [
          {
            id: 'card-1',
            list_id: 'list-1',
            board_id: 'board-1',
            type: Card.Types.PROJECT,
            position: null,
            name: 'Frontend task',
            list_changed_at: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
      };
    };
  });

  afterEach(() => {
    sails.sendNativeQuery = originalSendNativeQuery;
  });

  it('uses an included label condition when labelIds are provided', async () => {
    await Card.qm.getByEndlessListId('list-1', {
      labelIds: ['label-1', 'label-2'],
    });

    expect(nativeQueryCalls).to.have.length(1);
    expect(nativeQueryCalls[0].query).to.include('LEFT JOIN card_label');
    expect(nativeQueryCalls[0].query).to.include('card_label.label_id IN ($2, $3)');
    expect(nativeQueryCalls[0].values).to.deep.equal(['list-1', 'label-1', 'label-2']);
  });

  it('uses a NOT EXISTS condition when excludedLabelIds are provided', async () => {
    await Card.qm.getByEndlessListId('list-1', {
      excludedLabelIds: ['label-1', 'label-2'],
    });

    expect(nativeQueryCalls).to.have.length(1);
    expect(nativeQueryCalls[0].query).to.include('NOT EXISTS');
    expect(nativeQueryCalls[0].query).to.include('excluded_card_label.card_id = card.id');
    expect(nativeQueryCalls[0].query).to.include('excluded_card_label.label_id IN ($2, $3)');
    expect(nativeQueryCalls[0].values).to.deep.equal(['list-1', 'label-1', 'label-2']);
  });

  it('combines included and excluded labels with AND semantics', async () => {
    await Card.qm.getByEndlessListId('list-1', {
      labelIds: ['label-1'],
      excludedLabelIds: ['label-2'],
    });

    expect(nativeQueryCalls).to.have.length(1);
    expect(nativeQueryCalls[0].query).to.include('card_label.label_id IN ($2)');
    expect(nativeQueryCalls[0].query).to.include('NOT EXISTS');
    expect(nativeQueryCalls[0].query).to.include('excluded_card_label.label_id IN ($3)');
    expect(nativeQueryCalls[0].values).to.deep.equal(['list-1', 'label-1', 'label-2']);
  });

  it('combines search and excluded label filters', async () => {
    await Card.qm.getByEndlessListId('list-1', {
      search: 'task',
      excludedLabelIds: ['label-1'],
    });

    expect(nativeQueryCalls).to.have.length(1);
    expect(nativeQueryCalls[0].query).to.include('card.name ILIKE ALL');
    expect(nativeQueryCalls[0].query).to.include('NOT EXISTS');
    expect(nativeQueryCalls[0].query).to.include('excluded_card_label.label_id IN ($3)');
    expect(nativeQueryCalls[0].values).to.deep.equal(['list-1', 'task', 'label-1']);
  });
});
