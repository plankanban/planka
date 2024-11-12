const LocalFileManager = require('./LocalFileManager');
const S3FileManager = require('./S3FileManager');

/**
 * file-manager hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineFileManagerHook(sails) {
  let instance = null;

  const createInstance = () => {
    instance = sails.hooks.s3.isActive()
      ? new S3FileManager(sails.hooks.s3.getClient())
      : new LocalFileManager();
  };

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`file-manager`)');

      return new Promise((resolve) => {
        sails.after('hook:s3:loaded', () => {
          createInstance();
          resolve();
        });
      });
    },

    getInstance() {
      return instance;
    },
  };
};
