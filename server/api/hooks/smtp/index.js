const nodemailer = require('nodemailer');

module.exports = function smtpServiceHook(sails) {
  let transporter = null;

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      if (sails.config.custom.smtpHost) {
        transporter = nodemailer.createTransport({
          pool: true,
          host: sails.config.custom.smtpHost,
          port: sails.config.custom.smtpPort,
          secure: sails.config.custom.smtpSecure,
          auth: sails.config.custom.smtpUser && {
            user: sails.config.custom.smtpUser,
            pass: sails.config.custom.smtpPassword,
          },
        });
        sails.log.info('SMTP hook has been loaded successfully');
      }
    },

    getTransporter() {
      return transporter;
    },

    isActive() {
      return transporter !== null;
    },
  };
};
