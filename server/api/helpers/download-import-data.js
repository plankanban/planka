const util = require('util');
const stream = require('stream');
const streamToArray = require('stream-to-array');

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
      // eslint-disable-next-line no-param-reassign
      file.extra = buffer.toString('UTF-8');
      return done();
    };

    return exits.success(receiver);
  },
};
