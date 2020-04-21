const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const streamToArray = require('stream-to-array');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

const writeFile = util.promisify(fs.writeFile);

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

      const buffer = await streamToArray(file).then((parts) =>
        Buffer.concat(parts.map((part) => (util.isBuffer(part) ? part : Buffer.from(part)))),
      );

      let thumbnailBuffer;

      try {
        thumbnailBuffer = await sharp(buffer).resize(240, 240).jpeg().toBuffer();
      } catch (error) {} // eslint-disable-line no-empty

      try {
        const dirname = uuid();
        const dirPath = path.join(sails.config.custom.attachmentsPath, dirname);

        fs.mkdirSync(dirPath);

        if (thumbnailBuffer) {
          await writeFile(path.join(dirPath, '240.jpg'), thumbnailBuffer);
        }

        await writeFile(path.join(dirPath, file.filename), buffer);

        // eslint-disable-next-line no-param-reassign
        file.extra = {
          dirname,
          isImage: !!thumbnailBuffer,
        };

        return done();
      } catch (error) {
        return done(error);
      }
    };

    return exits.success(receiver);
  },
};
