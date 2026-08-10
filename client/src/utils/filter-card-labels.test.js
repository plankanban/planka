import filterCardLabels from './filter-card-labels';

const makeCard = (id, labelIds) => ({
  id,
  labels: labelIds.map((labelId) => ({ id: labelId })),
});

describe('filterCardLabels', () => {
  it('keeps cards that have any included label', () => {
    const cards = [makeCard('card-1', ['frontend']), makeCard('card-2', ['backend'])];

    expect(filterCardLabels(cards, ['frontend'], [])).toEqual([cards[0]]);
  });

  it('keeps cards that have none of the excluded labels, including unlabeled cards', () => {
    const cards = [
      makeCard('card-1', ['frontend']),
      makeCard('card-2', ['backend']),
      makeCard('card-3', []),
    ];

    expect(filterCardLabels(cards, [], ['frontend'])).toEqual([cards[1], cards[2]]);
  });

  it('combines included and excluded labels with AND semantics', () => {
    const cards = [
      makeCard('card-1', ['frontend', 'blocked']),
      makeCard('card-2', ['frontend']),
      makeCard('card-3', ['backend']),
    ];

    expect(filterCardLabels(cards, ['frontend'], ['blocked'])).toEqual([cards[1]]);
  });
});
