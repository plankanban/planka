const fs = require('fs');
const path = require('path');
const util = require('util');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

const writeFile = util.promisify(fs.writeFile);

module.exports = {
  sync: true,
  inputs: {
    attachment: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  fn(inputs, exits) {
    const dirname = uuid();
    const filename = inputs.attachment.fileName;
    const rootPath = path.join(sails.config.custom.attachmentsPath, dirname);
    fs.mkdirSync(rootPath);
    const writeStream = fs.createWriteStream(path.join(rootPath, filename));
    writeStream.on('finish', async () => {
      const image = sharp(fs.readFileSync(path.join(rootPath, filename)));
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

        await sails.helpers.createAttachment(
          inputs.card,
          inputs.user,
          {
            dirname,
            filename: inputs.attachment.name,
            isImage: !!imageMetadata,
            name: inputs.attachment.name,
          },
          null,
          inputs.request,
        );
      }
    });
    return exits.success(writeStream);
  },
};
