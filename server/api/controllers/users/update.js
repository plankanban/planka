const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    isAdmin: {
      type: 'boolean',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    avatarUrl: {
      type: 'json',
      custom: (value) => _.isNull(value),
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
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      if (inputs.id !== currentUser.id) {
        throw Errors.USER_NOT_FOUND; // Forbidden
      }

      delete inputs.isAdmin; // eslint-disable-line no-param-reassign
    }

    let user = await sails.helpers.users.getOne(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const values = _.pick(inputs, [
      'isAdmin',
      'name',
      'avatarUrl',
      'phone',
      'organization',
      'subscribeToOwnCards',
    ]);

    user = await sails.helpers.users.updateOne(user, values, this.req);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: user,
    };
  },
};
