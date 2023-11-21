const nodemailer = require('nodemailer');

const mailerConfig = {
  host: sails.config.custom.mailConnectorHost,
  port: sails.config.custom.mailConnectorPort,
};
if (sails.config.custom.mailConnectorUser) {
  Object.assign(mailerConfig, {
    auth: {
      user: sails.config.custom.mailConnectorUser,
      pass: sails.config.custom.mailConnectorPass,
    },
  });
}
const transport = nodemailer.createTransport(mailerConfig);

const sendEmail = async ({ to, subject, text, cc }) => {
  try {
    await transport.sendMail({
      from: sails.config.custom.mailConnectorEmail,
      to,
      cc,
      subject,
      html: text,
    });
  } catch (e) {
    sails.log(e);
  }
};

const sendUserEmails = async ({ ids, subject, text, cc }) => {
  const users = await sails.helpers.users.getMany(ids);
  return sendEmail({ to: users.map((u) => u.email), subject, text, cc });
};

module.exports = { sendEmail, sendUserEmails };
