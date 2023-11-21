const { sendEmail } = require('../../../utils/mail');

module.exports = {
  inputs: {
    to: {
      type: 'json',
      required: false,
    },
    subject: {
      type: 'string',
      required: false,
    },
    text: {
      type: 'string',
      required: false,
    },
    cc: {
      type: 'json',
      required: false,
    },
  },
  async fn({ to = [], subject = '', text = '', cc = [] }) {
    const mailResult = await sendEmail({ to, subject, text, cc });
    return mailResult;
  },
};
