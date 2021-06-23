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
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    let user;
    if (currentUser.isAdmin) {
      user = await sails.helpers.users.getOne(inputs.id);

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }
    } else if (inputs.id !== currentUser.id) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    } else {
      user = currentUser;
    }

    this.req
      .file('file')
      .upload(sails.helpers.utils.createUserAvatarReceiver(), async (error, files) => {
        if (error) {
          return exits.uploadError(error.message);
        }

        if (files.length === 0) {
          return exits.uploadError('No file was uploaded');
        }

        user = await sails.helpers.users.updateOne(
          user,
          {
            avatarDirname: files[0].extra.dirname,
          },
          this.req,
        );

        if (!user) {
          throw Errors.USER_NOT_FOUND;
        }

        return exits.success({
          item: user.toJSON(),
        });
      });
  },
};
