import { DueDateColorSchemes } from '../constants/Enums';
import { getDueDateStatusIconColor, getDueDateStatusStyle } from './due-date-color-schemes';

describe('getDueDateStatusStyle', () => {
  test('uses the existing status styles for the default scheme', () => {
    expect(getDueDateStatusStyle('dueSoon', DueDateColorSchemes.DEFAULT)).toBe('dueSoon');
    expect(getDueDateStatusStyle('overdue', DueDateColorSchemes.DEFAULT)).toBe('overdue');
    expect(getDueDateStatusStyle('completed', DueDateColorSchemes.DEFAULT)).toBe('completed');
  });

  test('uses color-blind-friendly status styles for the blue/orange scheme', () => {
    expect(getDueDateStatusStyle('dueSoon', DueDateColorSchemes.BLUE_ORANGE)).toBe(
      'blueOrangeDueSoon',
    );
    expect(getDueDateStatusStyle('overdue', DueDateColorSchemes.BLUE_ORANGE)).toBe(
      'blueOrangeOverdue',
    );
    expect(getDueDateStatusStyle('completed', DueDateColorSchemes.BLUE_ORANGE)).toBe(
      'blueOrangeCompleted',
    );
  });

  test('falls back to the default scheme for unknown values', () => {
    expect(getDueDateStatusStyle('overdue', null)).toBe('overdue');
    expect(getDueDateStatusStyle('overdue', 'unknown')).toBe('overdue');
  });

  test('uses color-blind-friendly icon colors for the blue/orange scheme', () => {
    expect(getDueDateStatusIconColor('dueSoon', DueDateColorSchemes.BLUE_ORANGE)).toBe('orange');
    expect(getDueDateStatusIconColor('overdue', DueDateColorSchemes.BLUE_ORANGE)).toBe('blue');
    expect(getDueDateStatusIconColor('completed', DueDateColorSchemes.BLUE_ORANGE)).toBe('teal');
  });
});
