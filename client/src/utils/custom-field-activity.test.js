import {
  MAX_CUSTOM_FIELD_ACTIVITY_CONTENT_LENGTH,
  getCustomFieldActivityValues,
} from './custom-field-activity';

describe('getCustomFieldActivityValues', () => {
  test('returns field name and content', () => {
    expect(
      getCustomFieldActivityValues({ customFieldName: 'block_reason', content: 'waiting on CI' }),
    ).toEqual({ customField: 'block_reason', content: 'waiting on CI' });
  });

  test('truncates long content', () => {
    const { content } = getCustomFieldActivityValues({
      customFieldName: 'block_reason',
      content: 'x'.repeat(500),
    });

    expect(content).toHaveLength(MAX_CUSTOM_FIELD_ACTIVITY_CONTENT_LENGTH);
    expect(content.endsWith('...')).toBeTruthy();
  });

  test('tolerates missing data', () => {
    expect(getCustomFieldActivityValues(undefined)).toEqual({ customField: '', content: '' });
  });
});
