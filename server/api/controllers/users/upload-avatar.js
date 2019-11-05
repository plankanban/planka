const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const uuid = require('uuid/v4');
const sharp = require('sharp');

const Errors = {
  USER_NOT_FOUND: {
    notFound: 'User is not found',
  },
};

const pipeline = util.promisify(stream.pipeline);

const createReceiver = () => {
  const receiver = stream.Writable({ objectMode: true });

  let firstFileHandled = false;
  // eslint-disable-next-line no-underscore-dangle
  receiver._write = async (file, receiverEncoding, done) => {
    if (firstFileHandled) {
      file.pipe(
        new stream.Writable({
          write(chunk, streamEncoding, callback) {
            callback();
          },
        }),
      );

      return done();
    }
    firstFileHandled = true;

    const resize = sharp()
      .resize(36, 36)
      .jpeg();

    const transform = new stream.Transform({
      transform(chunk, streamEncoding, callback) {
        callback(null, chunk);
      },
    });

    try {
      await pipeline(file, resize, transform);

      file.fd = `${uuid()}.jpg`;

      await pipeline(
        transform,
        fs.createWriteStream(path.join(sails.config.custom.uploadsPath, file.fd)),
      );

      return done();
    } catch (error) {
      return done(error);
    }
  };

  return receiver;
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
    notFound: {
      responseType: 'notFound',
    },
    unprocessableEntity: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    let user;
    if (currentUser.isAdmin) {
      user = await sails.helpers.getUser(inputs.id);

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }
    } else if (inputs.id !== currentUser.id) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    } else {
      user = currentUser;
    }

    this.req.file('file').upload(createReceiver(), async (error, files) => {
      if (error) {
        return exits.unprocessableEntity(error.message);
      }

      if (files.length === 0) {
        return exits.unprocessableEntity('No file was uploaded');
      }

      user = await sails.helpers.updateUser(
        user,
        {
          avatar: files[0].fd,
        },
        this.req,
      );

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }

      return exits.success({
        item: user.toJSON().avatar,
      });
    });
  },
};
