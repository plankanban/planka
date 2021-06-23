module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const fieldName = inputs.emailOrUsername.includes('@') ? 'email' : 'username';

    return sails.helpers.users.getOne({
      [fieldName]: inputs.emailOrUsername.toLowerCase(),
    });
  },
};
