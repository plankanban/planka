const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

const CURRENT_USER_ID = 'me';

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+|me$/,
      required: true,
    },
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    let user;
    if (inputs.id === CURRENT_USER_ID) {
      ({ currentUser: user } = this.req);

      if (inputs.subscribe && this.req.isSocket) {
        sails.sockets.join(this.req, `user:${user.id}`);
      }
    } else {
      user = await sails.helpers.users.getOne(inputs.id);

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }
    }

    return {
      item: user,
    };
  },
};
