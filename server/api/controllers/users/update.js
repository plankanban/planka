const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

const avatarUrlValidator = (value) => _.isNull(value);

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
      custom: avatarUrlValidator,
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
    language: {
      type: 'string',
      isIn: User.LANGUAGES,
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

    if (user.email === sails.config.custom.defaultAdminEmail) {
      /* eslint-disable no-param-reassign */
      delete inputs.isAdmin;
      delete inputs.name;
      /* eslint-enable no-param-reassign */
    } else if (user.isSso) {
      if (!sails.config.custom.oidcIgnoreRoles) {
        delete inputs.isAdmin; // eslint-disable-line no-param-reassign
      }

      delete inputs.name; // eslint-disable-line no-param-reassign
    }

    const values = {
      ..._.pick(inputs, [
        'isAdmin',
        'name',
        'phone',
        'organization',
        'language',
        'subscribeToOwnCards',
      ]),
      avatar: inputs.avatarUrl,
    };

    user = await sails.helpers.users.updateOne.with({
      values,
      record: user,
      actorUser: currentUser,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: user,
    };
  },
};
