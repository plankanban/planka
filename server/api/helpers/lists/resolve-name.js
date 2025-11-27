/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    t: {
      type: 'ref',
    },
  },

  fn(inputs) {
    if (inputs.record.name) {
      return inputs.record.name;
    }

    const name = _.upperFirst(inputs.record.type);
    return inputs.t ? inputs.t(name) : name;
  },
};
