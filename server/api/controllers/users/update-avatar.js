const util = require('util');
const rimraf = require('rimraf');
const { v4: uuid } = require('uuid');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  NO_FILE_WAS_UPLOADED: {
    noFileWasUploaded: 'No file was uploaded',
  },
  FILE_IS_NOT_IMAGE: {
    fileIsNotImage: 'File is not image',
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
    noFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    fileIsNotImage: {
      responseType: 'unprocessableEntity',
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

    const upload = util.promisify((options, callback) =>
      this.req.file('file').upload(options, (error, files) => callback(error, files)),
    );

    let files;
    try {
      files = await upload({
        saveAs: uuid(),
        maxBytes: null,
      });
    } catch (error) {
      return exits.uploadError(error.message); // TODO: add error
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    const fileData = await sails.helpers.users
      .processUploadedAvatarFile(file)
      .intercept('fileIsNotImage', () => {
        try {
          rimraf.sync(file.fd);
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }

        return Errors.FILE_IS_NOT_IMAGE;
      });

    user = await sails.helpers.users.updateOne.with({
      record: user,
      values: {
        avatar: fileData,
      },
      actorUser: currentUser,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return exits.success({
      item: user,
    });
  },
};
