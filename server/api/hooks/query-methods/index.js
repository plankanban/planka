/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * query-methods hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

const fs = require('fs');
const path = require('path');

module.exports = function defineQueryMethodsHook(sails) {
  const addQueryMethods = () => {
    const queryMethodsByModelName = fs.readdirSync(path.join(__dirname, 'models')).reduce(
      (result, filename) => ({
        ...result,
        // eslint-disable-next-line global-require, import/no-dynamic-require
        [path.parse(filename).name]: require(path.join(__dirname, 'models', filename)),
      }),
      {},
    );

    _(sails.models).forEach((Model) => {
      const queryMethods = queryMethodsByModelName[Model.globalId];

      if (queryMethods) {
        Object.assign(Model, {
          qm: queryMethods,
        });
      }
    });
  };

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`query-methods`)');

      return new Promise((resolve) => {
        sails.after('hook:orm:loaded', () => {
          addQueryMethods();
          resolve();
        });
      });
    },
  };
};
