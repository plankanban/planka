/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * smtp hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

const nodemailer = require('nodemailer');

module.exports = function defineSmtpHook(sails) {
  let transporter = null;

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      if (!this.isEnabled()) {
        return;
      }

      sails.log.info('Initializing custom hook (`smtp`)');

      transporter = nodemailer.createTransport({
        pool: true,
        host: sails.config.custom.smtpHost,
        port: sails.config.custom.smtpPort,
        name: sails.config.custom.smtpName,
        secure: sails.config.custom.smtpSecure,
        auth: sails.config.custom.smtpUser && {
          user: sails.config.custom.smtpUser,
          pass: sails.config.custom.smtpPassword,
        },
        tls: {
          rejectUnauthorized: sails.config.custom.smtpTlsRejectUnauthorized,
        },
      });
    },

    getTransporter() {
      return transporter;
    },

    isEnabled() {
      return !!sails.config.custom.smtpHost;
    },
  };
};
