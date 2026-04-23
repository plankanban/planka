/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const validator = require('validator');
const zxcvbn = require('zxcvbn');
const moment = require('moment');

const MAX_STRING_ID = '9223372036854775807';

const ID_REGEX = /^[1-9][0-9]*$/;
const IDS_WITH_COMMA_REGEX = /^[1-9][0-9]*(,[1-9][0-9]*)*$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;
const CARD_REPEAT_TYPES = ['weekly', 'monthly', 'yearly'];

const is = (defaultValue) => (value) => value === defaultValue;

const isUrl = (value) =>
  validator.isURL(value, {
    protocols: ['http', 'https'],
    require_tld: false,
    require_protocol: true,
  });

const isIdInRange = (value) => value.length < MAX_STRING_ID.length || value <= MAX_STRING_ID;

const isIdsWithCommaInRange = (value) => _.every(value.split(','), isIdInRange);

const isId = (value) =>
  value.length <= MAX_STRING_ID.length && ID_REGEX.test(value) && isIdInRange(value);

const isIds = (values) => _.every(values, isId);

const isPassword = (value) => zxcvbn(value).score >= 2; // TODO: move to config

const isEmailOrUsername = (value) =>
  value.includes('@')
    ? validator.isEmail(value)
    : value.length >= 3 && value.length <= 32 && USERNAME_REGEX.test(value);

const isDueDate = (value) => moment(value, moment.ISO_8601, true).isValid();

const isStopwatch = (value) => {
  if (!_.isPlainObject(value) || _.size(value) !== 2) {
    return false;
  }

  if (!_.isNull(value.startedAt) && !moment(value.startedAt, moment.ISO_8601, true).isValid()) {
    return false;
  }

  if (!_.isFinite(value.total) || value.total < 0) {
    return false;
  }

  return true;
};

const isIntegerInRange = (value, min, max) =>
  _.isInteger(value) && value >= min && value <= max;

const isCardRepeatRule = (value) => {
  if (_.isNull(value)) {
    return true;
  }

  if (!_.isPlainObject(value) || !CARD_REPEAT_TYPES.includes(value.type)) {
    return false;
  }

  const hasValidStartsAt =
    _.isString(value.startsAt) && moment(value.startsAt, moment.ISO_8601, true).isValid();

  if (!hasValidStartsAt) {
    return false;
  }

  if (
    !_.isUndefined(value.timezoneOffset) &&
    (!_.isInteger(value.timezoneOffset) ||
      value.timezoneOffset < -14 * 60 ||
      value.timezoneOffset > 14 * 60)
  ) {
    return false;
  }

  switch (value.type) {
    case 'weekly':
      return (
        _.isArray(value.weekdays) &&
        value.weekdays.length > 0 &&
        value.weekdays.length <= 7 &&
        _.uniq(value.weekdays).length === value.weekdays.length &&
        _.every(value.weekdays, (weekday) => isIntegerInRange(weekday, 0, 6))
      );
    case 'monthly':
      return isIntegerInRange(value.dayOfMonth, 1, 31);
    case 'yearly':
      return (
        isIntegerInRange(value.month, 0, 11) &&
        isIntegerInRange(value.dayOfMonth, 1, 31)
      );
    default:
      return false;
  }
};

module.exports = {
  MAX_STRING_ID,

  ID_REGEX,
  IDS_WITH_COMMA_REGEX,
  USERNAME_REGEX,

  is,
  isUrl,
  isIdInRange,
  isIdsWithCommaInRange,
  isId,
  isIds,
  isPassword,
  isEmailOrUsername,
  isDueDate,
  isStopwatch,
  isCardRepeatRule,
};
