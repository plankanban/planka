const bcrypt = require('bcrypt');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isString(value.email)) {
    return false;
  }

  if (!_.isNil(value.password) && !_.isString(value.password)) {
    return false;
  }

  if (!_.isNil(value.username) && !_.isString(value.username)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    actorUser: {
      type: 'ref',
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
    const { values } = inputs;

    if (values.password) {
      values.password = bcrypt.hashSync(values.password, 10);
    }

    if (values.username) {
      values.username = values.username.toLowerCase();
    }

    const user = await User.create({
      ...values,
      email: values.email.toLowerCase(),
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

    sails.helpers.utils.sendWebhooks.with({
      event: 'userCreate',
      data: {
        item: user,
      },
      user: inputs.actorUser,
    });

    return user;
  },
};
