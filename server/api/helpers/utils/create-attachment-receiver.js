const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const streamToArray = require('stream-to-array');
const filenamify = require('filenamify');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

const writeFile = util.promisify(fs.writeFile);

module.exports = {
  sync: true,

  fn() {
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

        // FIXME: https://github.com/sindresorhus/filenamify/issues/13
        const filename = filenamify(file.filename);

        const rootPath = path.join(sails.config.custom.attachmentsPath, dirname);
        fs.mkdirSync(rootPath);

        await writeFile(path.join(rootPath, filename), buffer);

        const image = sharp(buffer);
        let metadata;

        try {
          metadata = await image.metadata();
        } catch (error) {} // eslint-disable-line no-empty

        const extra = {
          dirname,
          name: file.filename,
        };

        if (metadata && !['svg', 'pdf'].includes(metadata.format)) {
          let cover256Buffer;
          if (metadata.height > metadata.width) {
            cover256Buffer = await image
              .resize(256, 320)
              .jpeg({
                quality: 100,
                chromaSubsampling: '4:4:4',
              })
              .toBuffer();
          } else {
            cover256Buffer = await image
              .resize({
                width: 256,
              })
              .jpeg({
                quality: 100,
                chromaSubsampling: '4:4:4',
              })
              .toBuffer();
          }

          const thumbnailsPath = path.join(rootPath, 'thumbnails');
          fs.mkdirSync(thumbnailsPath);

          await writeFile(path.join(thumbnailsPath, 'cover-256.jpg'), cover256Buffer);

          extra.image = _.pick(metadata, ['width', 'height']);
        } else {
          extra.image = null;
        }

        Object.assign(file, {
          filename,
          extra,
        });

        return done();
      } catch (error) {
        return done(error);
      }
    };

    return receiver;
  },
};
