const Errors = {
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
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
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
    },
    phone: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    organization: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
    },
  },

  exits: {
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const values = _.pick(inputs, [
      'email',
      'password',
      'name',
      'username',
      'phone',
      'organization',
      'subscribeToOwnCards',
    ]);

    const user = await sails.helpers.users
      .createOne(values, this.req)
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE);

    return {
      item: user,
    };
  },
};
