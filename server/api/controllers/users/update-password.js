const bcrypt = require('bcrypt');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INVALID_CURRENT_PASSWORD: {
    invalidCurrentPassword: 'Invalid current password',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
    invalidCurrentPassword: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id === currentUser.id) {
      if (!inputs.currentPassword) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    } else if (!currentUser.isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await sails.helpers.users.getOne(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (
      inputs.id === currentUser.id &&
      !bcrypt.compareSync(inputs.currentPassword, user.password)
    ) {
      throw Errors.INVALID_CURRENT_PASSWORD;
    }

    const values = _.pick(inputs, ['password']);
    user = await sails.helpers.users.updateOne(user, values, this.req);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    // Disconnect all sockets from this user except the current one
    const tempRoom = `temp:${user.id}`;
    sails.sockets.addRoomMembersToRooms(`user:${user.id}`, tempRoom, () => {
      if (currentUser.id === user.id && this.req.isSocket) {
        sails.sockets.leave(this.req, tempRoom, () => {
          sails.sockets.leaveAll(tempRoom);
        });
      } else {
        sails.sockets.leaveAll(tempRoom);
      }
    });

    if (currentUser.id === user.id) {
      const accessToken = sails.helpers.utils.signToken(user.id);

      return {
        accessToken,
        item: user,
      };
    }

    return {
      item: user,
    };
  },
};
