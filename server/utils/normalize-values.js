/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const normalizeValues = (rules, values, record) => {
  if (record) {
    // eslint-disable-next-line no-param-reassign
    values = {
      ...record,
      ...values,
    };
  }

  return Object.entries(rules).reduce((result, [fieldName, { setTo, defaultTo }]) => {
    let value = values[fieldName];

    if (!_.isUndefined(setTo)) {
      const setToValue = _.isFunction(setTo) ? setTo(values) : setTo;

      if (!_.isUndefined(setToValue)) {
        value = setToValue;
      }
    }

    if (!_.isUndefined(defaultTo) && _.isNil(value)) {
      const defaultToValue = _.isFunction(defaultTo) ? defaultTo(values) : defaultTo;

      if (!_.isUndefined(defaultToValue)) {
        value = defaultToValue;
      }
    }

    if (!_.isUndefined(value)) {
      if (!record || value !== record[fieldName]) {
        result[fieldName] = value; // eslint-disable-line no-param-reassign
      }
    }

    return result;
  }, {});
};

module.exports = normalizeValues;
