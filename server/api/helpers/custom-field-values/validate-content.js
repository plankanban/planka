/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const ISO_DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/;

const VALIDATORS_BY_TYPE = {
  text: () => true,
  number: (content) => content.trim() !== '' && Number.isFinite(Number(content)),
  date: (content) => ISO_DATE_REGEXP.test(content) && !Number.isNaN(Date.parse(content)),
  checkbox: (content) => content === 'true' || content === 'false',
  dropdown: (content, customField) =>
    !!customField.config &&
    Array.isArray(customField.config.options) &&
    customField.config.options.some((option) => option.id === content),
};

module.exports = {
  inputs: {
    customField: {
      type: 'ref',
      required: true,
    },
    content: {
      type: 'string',
      required: true,
    },
  },

  sync: true,

  fn(inputs) {
    const validator = VALIDATORS_BY_TYPE[inputs.customField.type] || VALIDATORS_BY_TYPE.text;

    return validator(inputs.content, inputs.customField);
  },
};
