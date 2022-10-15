module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      required: true,
    },
    includeSSOUsers: {
      type: 'boolean',
      defaultsTo: true,
    },
  },

  async fn(inputs) {
    const fieldName = inputs.emailOrUsername.includes('@') ? 'email' : 'username';

    const conditions = { [fieldName]: inputs.emailOrUsername.toLowerCase() };

    if (includeSSOUsers) {
      conditions[ssoId] = null;
    }

    return sails.helpers.users.getOne(conditions);
  },
};
