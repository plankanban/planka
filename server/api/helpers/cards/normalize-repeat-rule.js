/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const MINUTE = 60 * 1000;
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

const toFixedLocalDate = (date, timezoneOffset) =>
  new Date(date.getTime() - timezoneOffset * MINUTE);

module.exports = {
  sync: true,

  inputs: {
    rule: {
      type: 'json',
      required: true,
    },
  },

  fn(inputs) {
    const timezoneOffset = _.isFinite(inputs.rule.timezoneOffset)
      ? inputs.rule.timezoneOffset
      : 0;

    const startsAt = new Date(inputs.rule.startsAt);
    const localStartsAt = toFixedLocalDate(startsAt, timezoneOffset);

    const time = {
      hour: localStartsAt.getUTCHours(),
      minute: localStartsAt.getUTCMinutes(),
      startsAt: startsAt.toISOString(),
      timezoneOffset,
    };

    switch (inputs.rule.type) {
      case Card.RepeatTypes.WEEKLY:
        return {
          type: Card.RepeatTypes.WEEKLY,
          weekdays: _.intersection(inputs.rule.weekdays, WEEKDAYS).sort(),
          ...time,
        };
      case Card.RepeatTypes.MONTHLY:
        return {
          type: Card.RepeatTypes.MONTHLY,
          dayOfMonth: inputs.rule.dayOfMonth || localStartsAt.getUTCDate(),
          ...time,
        };
      case Card.RepeatTypes.YEARLY:
        return {
          type: Card.RepeatTypes.YEARLY,
          month: _.isInteger(inputs.rule.month) ? inputs.rule.month : localStartsAt.getUTCMonth(),
          dayOfMonth: inputs.rule.dayOfMonth || localStartsAt.getUTCDate(),
          ...time,
        };
      default:
        return null;
    }
  },
};
