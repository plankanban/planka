const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: (value) => {
        if (!_.isPlainObject(value)) {
          return false;
        }

        if (!_.isString(value.email)) {
          return false;
        }

        if (!_.isString(value.password)) {
          return false;
        }

        if (value.username && !_.isString(value.username)) {
          return false;
        }

        return true;
      },
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
  },

  async fn(inputs) {
    if (inputs.values.username) {
      // eslint-disable-next-line no-param-reassign
      inputs.values.username = inputs.values.username.toLowerCase();
    }

    const user = await User.create({
      ...inputs.values,
      email: inputs.values.email.toLowerCase(),
      password: bcrypt.hashSync(inputs.values.password, 10),
    })
      .intercept(
        {
          message:
            'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_email_unique"',
        },
        'emailAlreadyInUse',
      )
      .intercept(
        {
          message:
            'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_username_unique"',
        },
        'usernameAlreadyInUse',
      )
      .fetch();

    // const userIds = await sails.helpers.users.getAdminIds();

    const users = await sails.helpers.users.getMany();
    const userIds = sails.helpers.utils.mapRecords(users);

    userIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'userCreate',
        {
          item: user,
        },
        inputs.request,
      );
    });

    return user;
  },
};
