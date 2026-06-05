import normalizeDescriptionPreviewText from './description-preview';

describe('normalizeDescriptionPreviewText', () => {
  it('preserves multiline text while normalizing carriage returns', () => {
    expect(normalizeDescriptionPreviewText('Ready\r\nReview\rDone')).toBe('Ready\nReview\nDone');
  });
});
