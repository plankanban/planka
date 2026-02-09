/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const nodemailer = require('nodemailer');

module.exports = {
  inputs: {
    defaultOptions: {
      type: 'json',
    },
  },

  async fn(inputs) {
    let config;
    let sourceConfig;

    if (sails.config.custom.smtpHost) {
      sourceConfig = sails.config.custom;
    } else {
      config = await Config.qm.getOneMain();

      if (config.smtpHost) {
        sourceConfig = config;

        // TODO: hack to make it work with proxy
        if (sourceConfig.smtpPort === null) {
          sourceConfig.smtpPort = sourceConfig.smtpSecure ? 465 : 587;
        }
      }
    }

    if (!sourceConfig) {
      return {
        config,
        transporter: null,
      };
    }

    const transporter = nodemailer.createTransport(
      {
        ...inputs.defaultOptions,
        host: sourceConfig.smtpHost,
        port: sourceConfig.smtpPort,
        name: sourceConfig.smtpName,
        secure: sourceConfig.smtpSecure,
        auth: sourceConfig.smtpUser && {
          user: sourceConfig.smtpUser,
          pass: sourceConfig.smtpPassword,
        },
        tls: {
          rejectUnauthorized: sourceConfig.smtpTlsRejectUnauthorized,
        },
        proxy:
          sails.config.custom.outgoingProxy && !sails.config.custom.smtpHost
            ? sails.config.custom.outgoingProxy
            : undefined,
      },
      {
        from: sourceConfig.smtpFrom,
      },
    );

    return {
      transporter,
      config,
    };
  },
};
