/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const MINUTE = 60 * 1000;
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

const toFixedLocalDate = (date, timezoneOffset) =>
  new Date(date.getTime() - timezoneOffset * MINUTE);

const fromFixedLocalParts = (year, month, day, hour, minute, timezoneOffset) =>
  new Date(Date.UTC(year, month, day, hour, minute, 0, 0) + timezoneOffset * MINUTE);

const getDaysInMonth = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

const normalizeMonth = (year, month) => {
  const normalizedDate = new Date(Date.UTC(year, month, 1));

  return {
    year: normalizedDate.getUTCFullYear(),
    month: normalizedDate.getUTCMonth(),
  };
};

const buildCandidate = (year, month, day, rule) => {
  const nextDay = Math.min(day, getDaysInMonth(year, month));

  return fromFixedLocalParts(
    year,
    month,
    nextDay,
    rule.hour,
    rule.minute,
    rule.timezoneOffset,
  );
};

module.exports = {
  sync: true,

  inputs: {
    rule: {
      type: 'json',
      required: true,
    },
    after: {
      type: 'ref',
    },
  },

  fn(inputs) {
    const rule = {
      timezoneOffset: 0,
      hour: 9,
      minute: 0,
      ...inputs.rule,
    };

    let after = inputs.after || new Date();
    const startsAt = rule.startsAt && new Date(rule.startsAt);

    if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt.getTime() > after.getTime()) {
      after = new Date(startsAt.getTime() - 1);
    }

    const afterTime = after.getTime();
    const afterLocal = toFixedLocalDate(after, rule.timezoneOffset);

    switch (rule.type) {
      case Card.RepeatTypes.WEEKLY: {
        const weekdays = _.intersection(rule.weekdays || [], WEEKDAYS).sort();

        for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
          const candidateLocal = new Date(
            Date.UTC(
              afterLocal.getUTCFullYear(),
              afterLocal.getUTCMonth(),
              afterLocal.getUTCDate() + dayOffset,
            ),
          );

          if (weekdays.includes(candidateLocal.getUTCDay())) {
            const candidate = fromFixedLocalParts(
              candidateLocal.getUTCFullYear(),
              candidateLocal.getUTCMonth(),
              candidateLocal.getUTCDate(),
              rule.hour,
              rule.minute,
              rule.timezoneOffset,
            );

            if (candidate.getTime() > afterTime) {
              return candidate.toISOString();
            }
          }
        }

        break;
      }
      case Card.RepeatTypes.MONTHLY:
        for (let monthOffset = 0; monthOffset <= 24; monthOffset += 1) {
          const { year, month } = normalizeMonth(
            afterLocal.getUTCFullYear(),
            afterLocal.getUTCMonth() + monthOffset,
          );

          const candidate = buildCandidate(year, month, rule.dayOfMonth, rule);

          if (candidate.getTime() > afterTime) {
            return candidate.toISOString();
          }
        }

        break;
      case Card.RepeatTypes.YEARLY:
        for (let yearOffset = 0; yearOffset <= 50; yearOffset += 1) {
          const candidate = buildCandidate(
            afterLocal.getUTCFullYear() + yearOffset,
            rule.month,
            rule.dayOfMonth,
            rule,
          );

          if (candidate.getTime() > afterTime) {
            return candidate.toISOString();
          }
        }

        break;
      default:
    }

    return null;
  },
};
