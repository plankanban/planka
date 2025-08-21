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

const Types = {
  GENERAL: 'general',
  EXTENDED: 'extended',
};

const LANGUAGES = ['de-DE', 'en-US'];
const DEFAULT_LANGUAGE = 'en-US';

const hashContent = (content) => crypto.createHash('sha256').update(content).digest('hex');

module.exports = function defineTermsHook(sails) {
  let signatureByType;
  let signaturesSet;

  return {
    Types,
    LANGUAGES,

    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`terms`)');

      signatureByType = {
        [Types.GENERAL]: hashContent(await this.getContent(Types.GENERAL)),
        [Types.EXTENDED]: hashContent(await this.getContent(Types.EXTENDED)),
      };

      signaturesSet = new Set(Object.values(signatureByType));
    },

    async getPayload(type, language = DEFAULT_LANGUAGE) {
      if (!Object.values(Types).includes(type)) {
        throw new Error(`Unknown type: ${type}`);
      }

      if (!LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE; // eslint-disable-line no-param-reassign
      }

      return {
        type,
        language,
        content: await this.getContent(type, language),
        signature: this.getSignatureByType(type),
      };
    },

    getTypeByUserRole(userRole) {
      return userRole === User.Roles.ADMIN ? Types.EXTENDED : Types.GENERAL;
    },

    getContent(type, language = DEFAULT_LANGUAGE) {
      return fsPromises.readFile(`${sails.config.appPath}/terms/${language}/${type}.md`, 'utf8');
    },

    getSignatureByType(type) {
      return signatureByType[type];
    },

    getSignatureByUserRole(userRole) {
      return signatureByType[this.getTypeByUserRole(userRole)];
    },

    hasSignature(signature) {
      return signaturesSet.has(signature);
    },
  };
};
