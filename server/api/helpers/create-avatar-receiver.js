const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

const pipeline = util.promisify(stream.pipeline);

module.exports = {
  sync: true,

  fn(inputs, exits) {
    const receiver = stream.Writable({
      objectMode: true,
    });

    let firstFileHandled = false;
    // eslint-disable-next-line no-underscore-dangle
    receiver._write = async (file, receiverEncoding, done) => {
      if (firstFileHandled) {
        file.pipe(new stream.Writable());

        return done();
      }
      firstFileHandled = true;

      const resize = sharp().resize(100, 100).jpeg();
      const passThrought = new stream.PassThrough();

      try {
        await pipeline(file, resize, passThrought);

        const dirname = uuid();
        const dirPath = path.join(sails.config.custom.userAvatarsPath, dirname);

        fs.mkdirSync(dirPath);

        await pipeline(passThrought, fs.createWriteStream(path.join(dirPath, '100.jpg')));

        // eslint-disable-next-line no-param-reassign
        file.extra = {
          dirname,
        };

        return done();
      } catch (error) {
        return done(error);
      }
    };

    return exits.success(receiver);
  },
};
