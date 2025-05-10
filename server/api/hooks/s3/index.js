/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * s3 hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

const { URL } = require('url');
const { S3Client } = require('@aws-sdk/client-s3');

module.exports = function defineS3Hook(sails) {
  let client = null;

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      if (!this.isEnabled()) {
        return;
      }

      sails.log.info('Initializing custom hook (`s3`)');

      client = new S3Client({
        endpoint: sails.config.custom.s3Endpoint,
        region: sails.config.custom.s3Region || '-',
        credentials: {
          accessKeyId: sails.config.custom.s3AccessKeyId,
          secretAccessKey: sails.config.custom.s3SecretAccessKey,
        },
        forcePathStyle: sails.config.custom.s3ForcePathStyle,
      });
    },

    getClient() {
      return client;
    },

    getBaseUrl() {
      if (sails.config.custom.s3Endpoint) {
        const { protocol, host } = new URL(sails.config.custom.s3Endpoint);

        if (sails.config.custom.s3ForcePathStyle) {
          return `${protocol}//${host}/${sails.config.custom.s3Bucket}`;
        }

        return `${protocol}//${sails.config.custom.s3Bucket}.${host}`;
      }

      if (sails.config.custom.s3ForcePathStyle) {
        return `https://s3.${sails.config.custom.s3Region}.amazonaws.com/${sails.config.custom.s3Bucket}`;
      }

      return `https://${sails.config.custom.s3Bucket}.s3.${sails.config.custom.s3Region}.amazonaws.com`;
    },

    isEnabled() {
      return !!sails.config.custom.s3Endpoint || !!sails.config.custom.s3Region;
    },
  };
};
