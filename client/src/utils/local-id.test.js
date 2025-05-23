import { isLocalId } from './local-id';

describe('isLocalId', () => {
  test('is valid', () => {
    expect(isLocalId('local:1234567890')).toBeTruthy();
  });

  test('is invalid', () => {
    expect(isLocalId('1234567890')).toBeFalsy();
  });
});
