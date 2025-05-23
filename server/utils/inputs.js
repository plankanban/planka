/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const {
  ID_REGEX,
  IDS_WITH_COMMA_REGEX,
  MAX_STRING_ID,
  isIdInRange,
  isIdsWithCommaInRange,
} = require('./validators');

const idInput = {
  type: 'string',
  maxLength: MAX_STRING_ID.length,
  regex: ID_REGEX,
  custom: isIdInRange,
};

const idsInput = {
  type: 'string',
  maxLength: MAX_STRING_ID.length * 100 + 99,
  regex: IDS_WITH_COMMA_REGEX,
  custom: isIdsWithCommaInRange,
};

module.exports = {
  idInput,
  idsInput,
};
