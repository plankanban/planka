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

      try {
        const dirname = uuid();

        const rootPath = path.join(sails.config.custom.attachmentsPath, dirname);
        fs.mkdirSync(rootPath);

        await writeFile(path.join(rootPath, file.filename), buffer);

        const image = sharp(buffer);
        let imageMetadata;

        try {
          imageMetadata = await image.metadata();
        } catch (error) {} // eslint-disable-line no-empty

        if (imageMetadata) {
          let cover256Buffer;
          if (imageMetadata.height > imageMetadata.width) {
            cover256Buffer = await image.resize(256, 320).jpeg().toBuffer();
          } else {
            cover256Buffer = await image
              .resize({
                width: 256,
              })
              .jpeg()
              .toBuffer();
          }

          const thumbnailsPath = path.join(rootPath, 'thumbnails');
          fs.mkdirSync(thumbnailsPath);

          await writeFile(path.join(thumbnailsPath, 'cover-256.jpg'), cover256Buffer);
        }

        // eslint-disable-next-line no-param-reassign
        file.extra = {
          dirname,
          isImage: !!imageMetadata,
        };

        return done();
      } catch (error) {
        return done(error);
      }
    };

    return exits.success(receiver);
  },
};
