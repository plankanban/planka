/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');

const CUSTOM_FIELD_TYPES = require('../../../utils/custom-field-types');

module.exports = {
  inputs: {
    type: {
      type: 'string',
      isIn: CUSTOM_FIELD_TYPES,
      required: true,
    },
    config: {
      type: 'json',
    },
  },

  exits: {
    invalidConfig: {},
  },

  fn(inputs) {
    if (inputs.type !== 'dropdown') {
      return {};
    }

    const config = inputs.config || {};

    if (!Array.isArray(config.options) || config.options.length === 0) {
      throw 'invalidConfig';
    }

    const options = config.options.map((option) => {
      if (!_.isPlainObject(option) || !_.isString(option.name) || !option.name.trim()) {
        throw 'invalidConfig';
      }

      if (!_.isNil(option.color) && !Label.COLORS.includes(option.color)) {
        throw 'invalidConfig';
      }

      return {
        id: _.isString(option.id) && option.id ? option.id : uuid(),
        name: option.name.trim(),
        color: option.color || null,
      };
    });

    return {
      options,
    };
  },
};
