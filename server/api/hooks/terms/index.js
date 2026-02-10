/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * terms hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

const fsPromises = require('fs').promises;
const crypto = require('crypto');

const LANGUAGES = ['de-DE', 'en-US'];
const DEFAULT_LANGUAGE = 'en-US';

const getContent = (language = DEFAULT_LANGUAGE) =>
  fsPromises.readFile(`${sails.config.appPath}/terms/${language}.md`, 'utf8');

const hashContent = (content) => crypto.createHash('sha256').update(content).digest('hex');

module.exports = function defineTermsHook(sails) {
  let signature;

  return {
    LANGUAGES,

    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`terms`)');

      const content = await getContent();
      signature = hashContent(content);
    },

    async getPayload(language = DEFAULT_LANGUAGE) {
      if (!LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE; // eslint-disable-line no-param-reassign
      }

      const content = await getContent(language);

      return {
        language,
        content,
        signature,
      };
    },

    isSignatureValid(value) {
      return value === signature;
    },
  };
};
