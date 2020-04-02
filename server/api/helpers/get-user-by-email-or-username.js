module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs, exits) {
    const fieldName = inputs.emailOrUsername.includes('@') ? 'email' : 'username';

    const user = await sails.helpers.getUser({
      [fieldName]: inputs.emailOrUsername.toLowerCase(),
    });

    return exits.success(user);
  },
};
