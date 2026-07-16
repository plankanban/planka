/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const path = require('path');
const I18n = require('i18n-2');

module.exports = {
  sync: true,

  inputs: {
    language: {
      type: 'string',
      allowNull: true,
    },
  },

  fn(inputs) {
    const i18n = new I18n({
      locales: sails.config.i18n.locales,
      defaultLocale: sails.config.i18n.defaultLocale,
      directory: path.join(sails.config.appPath, sails.config.i18n.localesDirectory),
      extension: '.json',
      devMode: false,
    });

    i18n.setLocale(inputs.language || sails.config.i18n.defaultLocale);

    /* eslint-disable no-underscore-dangle */
    const translator = i18n.__.bind(i18n);
    translator.n = i18n.__n.bind(i18n);
    /* eslint-enable no-underscore-dangle */

    return translator;
  },
};
