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
const path = require('path');
const crypto = require('crypto');

const PATH = path.join(sails.config.appPath, 'terms');
const TEMPLATE_TYPE = '_template';

const hashContent = (content) => crypto.createHash('sha256').update(content).digest('hex');

module.exports = function defineTermsHook(sails) {
  let type;
  let languages;
  let defaultLanguage;
  let signature;

  const getLanguages = async () => {
    const entries = await fsPromises.readdir(path.join(PATH, type), {
      withFileTypes: true,
    });

    return entries
      .filter((entry) => entry.isFile() && path.extname(entry.name) === '.md')
      .map((entry) => path.basename(entry.name, '.md'))
      .sort();
  };

  const getContent = (language) =>
    fsPromises.readFile(path.join(PATH, type, `${language}.md`), 'utf8');

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`terms`)');

      type = sails.config.custom.termsType;

      try {
        languages = await getLanguages();
      } catch (error) {
        /* empty */
      }

      if (!languages || languages.length === 0) {
        sails.log.warn('Custom terms not found, falling back to template');

        type = TEMPLATE_TYPE;
        languages = await getLanguages();
      }

      defaultLanguage = languages.includes(sails.config.i18n.defaultLocale)
        ? sails.config.i18n.defaultLocale
        : languages[0];

      const content = await getContent(defaultLanguage);
      signature = hashContent(content);
    },

    async getPayload(language) {
      if (!language || !languages.includes(language)) {
        language = defaultLanguage; // eslint-disable-line no-param-reassign
      }

      const content = await getContent(language);

      return {
        language,
        content,
        signature,
      };
    },

    getLanguages() {
      return languages;
    },

    isSignatureValid(value) {
      return value === signature;
    },
  };
};
