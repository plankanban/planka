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
        const originalBuffer = await sharp(buffer)
          .jpeg({
            quality: 100,
            chromaSubsampling: '4:4:4',
          })
          .toBuffer();

        const square100Buffer = await sharp(buffer)
          .resize(100, 100)
          .jpeg({
            quality: 100,
            chromaSubsampling: '4:4:4',
          })
          .toBuffer();

        const dirname = uuid();

        const rootPath = path.join(sails.config.custom.userAvatarsPath, dirname);
        fs.mkdirSync(rootPath);

        await writeFile(path.join(rootPath, 'original.jpg'), originalBuffer);
        await writeFile(path.join(rootPath, 'square-100.jpg'), square100Buffer);

        // eslint-disable-next-line no-param-reassign
        file.extra = {
          dirname,
        };

        return done();
      } catch (error) {
        return done(error);
      }
    };

    return receiver;
  },
};
