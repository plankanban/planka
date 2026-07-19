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
  },

  fn(inputs) {
    let { record } = inputs;

    if (sails.config.custom.smtpHost) {
      record = _.omit(record, Config.SMTP_FIELD_NAMES);
    } else if (record.smtpPassword) {
      record = _.omit(record, 'smtpPassword');
    }

    if (record.ldapBindPassword) {
      record = _.omit(record, 'ldapBindPassword');
    }

    if (record.ldapSshPassword) {
      record = _.omit(record, 'ldapSshPassword');
    }

    return record;
  },
};
