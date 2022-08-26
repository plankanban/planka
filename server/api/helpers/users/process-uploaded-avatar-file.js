const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    fileIsNotImage: {},
  },

  async fn(inputs) {
    const image = sharp(inputs.file.fd);

    try {
      await image.metadata();
    } catch (error) {
      throw 'fileIsNotImage';
    }

    const dirname = uuid();
    const rootPath = path.join(sails.config.custom.userAvatarsPath, dirname);

    fs.mkdirSync(rootPath);

    try {
      await image
        .jpeg({
          quality: 100,
          chromaSubsampling: '4:4:4',
        })
        .toFile(path.join(rootPath, 'original.jpg'));

      await image
        .resize(100, 100)
        .jpeg({
          quality: 100,
          chromaSubsampling: '4:4:4',
        })
        .toFile(path.join(rootPath, 'square-100.jpg'));
    } catch (error1) {
      try {
        rimraf.sync(rootPath);
      } catch (error2) {
        console.warn(error2.stack); // eslint-disable-line no-console
      }

      throw 'fileIsNotImage';
    }

    try {
      rimraf.sync(inputs.file.fd);
    } catch (error) {
      console.warn(error.stack); // eslint-disable-line no-console
    }

    return {
      dirname,
    };
  },
};
