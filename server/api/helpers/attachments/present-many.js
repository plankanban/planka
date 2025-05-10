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
  },

  fn(inputs) {
    return inputs.records.map((record) => sails.helpers.attachments.presentOne(record));
  },
};
