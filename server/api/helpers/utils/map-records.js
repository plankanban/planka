/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    records: {
      type: 'ref',
      required: true,
    },
    attribute: {
      type: 'string',
      defaultsTo: 'id',
    },
    unique: {
      type: 'boolean',
      defaultsTo: false,
    },
    withoutNull: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  fn(inputs) {
    let result = _.map(inputs.records, inputs.attribute);

    if (inputs.unique) {
      result = _.uniq(result);
    }

    if (inputs.withoutNull) {
      result = _.without(result, null);
    }

    return result;
  },
};
