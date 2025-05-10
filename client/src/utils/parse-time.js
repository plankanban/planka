/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import parseDate from 'date-fns/parse';

const TIME_REGEX =
  /^((\d{1,2})((:|\.)?(\d{1,2}))?)(a|p|(am|a\.m\.|midnight|mi|pm|p\.m\.|noon|n))?$/;

const ALTERNATIVE_AM_MERIDIEMS_SET = new Set(['am', 'a.m.', 'midnight', 'mi']);
const ALTERNATIVE_PM_MERIDIEMS_SET = new Set(['pm', 'p.m.', 'noon', 'n']);

const TimeFormats = {
  TWENTY_FOUR_HOUR: 'twentyFourHour',
  TWELVE_HOUR: 'twelveHour',
};

const PATTERNS_GROUPS_BY_TIME_FORMAT = {
  [TimeFormats.TWENTY_FOUR_HOUR]: {
    byNumbersTotal: {
      1: ['H'],
      2: ['HH'],
      3: ['Hmm'],
      4: ['HHmm'],
    },
    withDelimiter: ['H:m', 'H:mm', 'HH:m', 'HH:mm'],
  },
  [TimeFormats.TWELVE_HOUR]: {
    byNumbersTotal: {
      1: ['haaaaa'],
      2: ['hhaaaaa'],
      3: ['hmmaaaaa'],
      4: ['hhmmaaaaa'],
    },
    withDelimiter: ['h:maaaaa', 'h:mmaaaaa', 'hh:maaaaa', 'hh:mmaaaaa'],
  },
};

const INVALID_DATE = new Date('invalid-date');

const normalizeDelimeter = (delimeter) => (delimeter === '.' ? ':' : delimeter);

const normalizeMeridiem = (meridiem, alternativeMeridiem) => {
  if (meridiem && alternativeMeridiem) {
    if (ALTERNATIVE_AM_MERIDIEMS_SET.has(alternativeMeridiem)) {
      return 'a';
    }

    if (ALTERNATIVE_PM_MERIDIEMS_SET.has(alternativeMeridiem)) {
      return 'p';
    }
  }

  return meridiem;
};

const makeTimeString = (hours, minutes, delimeter, meridiem) => {
  let timeString = hours;
  if (delimeter) {
    timeString += delimeter;
  }
  if (minutes) {
    timeString += minutes;
  }
  if (meridiem) {
    timeString += meridiem;
  }

  return timeString;
};

export default (string, referenceDate) => {
  const match = string.replace(/\s/g, '').toLowerCase().match(TIME_REGEX);

  if (!match) {
    return INVALID_DATE;
  }

  const [, hoursAndMinutes, hours, , delimeter, minutes, meridiem, alternativeMeridiem] = match;

  const normalizedDelimeter = normalizeDelimeter(delimeter);
  const normalizedMeridiem = normalizeMeridiem(meridiem, alternativeMeridiem);

  const timeString = makeTimeString(hours, minutes, normalizedDelimeter, normalizedMeridiem);

  const timeFormat = meridiem ? TimeFormats.TWELVE_HOUR : TimeFormats.TWENTY_FOUR_HOUR;
  const patternsGroups = PATTERNS_GROUPS_BY_TIME_FORMAT[timeFormat];

  const patterns = delimeter
    ? patternsGroups.withDelimiter
    : patternsGroups.byNumbersTotal[hoursAndMinutes.length];

  if (!referenceDate) {
    referenceDate = new Date(); // eslint-disable-line no-param-reassign
  }

  for (let i = 0; i < patterns.length; i += 1) {
    const parsedDate = parseDate(timeString, patterns[i], referenceDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return INVALID_DATE;
};
