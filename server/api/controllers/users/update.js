const Errors = {
  USER_NOT_FOUND: {
    notFound: 'User is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true
    },
    isAdmin: {
      type: 'boolean'
    },
    name: {
      type: 'string',
      isNotEmptyString: true
    },
    avatar: {
      type: 'json',
      custom: value => _.isNull(value)
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      if (inputs.id !== currentUser.id) {
        throw Errors.USER_NOT_FOUND; // Forbidden
      }

      delete inputs.isAdmin;
    }

    let user = await sails.helpers.getUser(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const values = _.pick(inputs, ['isAdmin', 'name', 'avatar']);

    user = await sails.helpers.updateUser(user, values, this.req);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return exits.success({
      item: user
    });
  }
};
