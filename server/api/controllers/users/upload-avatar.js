const stream = require('stream');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');
const sharp = require('sharp');

const Errors = {
  USER_NOT_FOUND: {
    notFound: 'User is not found'
  }
};

const createReceiver = () => {
  const receiver = require('stream').Writable({ objectMode: true });

  let firstFileHandled = false;
  receiver._write = (file, encoding, done) => {
    if (firstFileHandled) {
      file.pipe(
        new stream.Writable({
          write(chunk, encoding, callback) {
            callback();
          }
        })
      );

      return done();
    }
    firstFileHandled = true;

    const resize = sharp()
      .resize(36, 36)
      .jpeg();

    const transform = new stream.Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk);
      }
    });

    stream.pipeline(file, resize, transform, error => {
      if (error) {
        return done(error.message);
      }

      file.fd = `${uuid()}.jpg`;

      const output = fs.createWriteStream(
        path.join(sails.config.custom.uploadsPath, file.fd)
      );

      stream.pipeline(transform, output, error => {
        if (error) {
          return done(error);
        }

        done();
      });
    });
  };

  return receiver;
};

module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    },
    unprocessableEntity: {
      responseType: 'unprocessableEntity'
    }
  },

  fn: async function(inputs, exits) {
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
        return exits.unprocessableEntity(error);
      }

      if (files.length === 0) {
        return exits.unprocessableEntity('No file was uploaded');
      }

      user = await sails.helpers.updateUser(
        user,
        {
          avatar: files[0].fd
        },
        this.req
      );

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }

      return this.res.json({
        item: user
      });
    });
  }
};
