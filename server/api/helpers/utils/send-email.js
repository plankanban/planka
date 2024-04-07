module.exports = {
  inputs: {
    to: {
      type: 'string',
      required: true,
    },
    subject: {
      type: 'string',
      required: true,
    },
    html: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const transporter = sails.hooks.smtp.getTransporter(); // TODO: check if active?

    try {
      const info = await transporter.sendMail({
        ...inputs,
        from: sails.config.custom.smtpFrom,
      });

      sails.log.info('Email sent: %s', info.messageId);
    } catch (error) {
      sails.log.error(error); // TODO: provide description text?
    }
  },
};
