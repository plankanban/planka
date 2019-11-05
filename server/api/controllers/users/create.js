const Errors = {
  USER_EXIST: {
    conflict: 'User is already exist',
  },
};

module.exports = {
  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    conflict: {
      responseType: 'conflict',
    },
  },

  async fn(inputs, exits) {
    const values = _.pick(inputs, ['email', 'password', 'name']);

    const user = await sails.helpers
      .createUser(values, this.req)
      .intercept('conflict', () => Errors.USER_EXIST);

    return exits.success({
      item: user,
    });
  },
};
