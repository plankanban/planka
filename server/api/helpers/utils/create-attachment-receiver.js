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
        let imageMetadata;

        try {
          imageMetadata = await image.metadata();
        } catch (error) {} // eslint-disable-line no-empty

        if (imageMetadata) {
          let cover256Buffer;
          if (imageMetadata.height > imageMetadata.width) {
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
        }

        // eslint-disable-next-line no-param-reassign
        file.extra = {
          dirname,
          isImage: !!imageMetadata,
          name: file.filename,
        };

        // eslint-disable-next-line no-param-reassign
        file.filename = filename;

        return done();
      } catch (error) {
        return done(error);
      }
    };

    return receiver;
  },
};
