const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { rimraf } = require('rimraf');

const PATH_SEGMENT_TO_URL_REPLACE_REGEX = /(public|private)\//;

const buildPath = (pathSegment) => path.join(sails.config.custom.uploadsBasePath, pathSegment);

class LocalFileManager {
  // eslint-disable-next-line class-methods-use-this
  async move(sourceFilePath, filePathSegment) {
    const { dir, base } = path.parse(filePathSegment);

    const dirPath = buildPath(dir);
    const filePath = path.join(dirPath, base);

    await fs.promises.mkdir(dirPath);
    await fse.move(sourceFilePath, filePath);

    return filePath;
  }

  // eslint-disable-next-line class-methods-use-this
  async save(filePathSegment, buffer) {
    await fse.outputFile(buildPath(filePathSegment), buffer);
  }

  // eslint-disable-next-line class-methods-use-this
  read(filePathSegment) {
    const filePath = buildPath(filePathSegment);

    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }

    return fs.createReadStream(filePath);
  }

  // eslint-disable-next-line class-methods-use-this
  async deleteDir(dirPathSegment) {
    await rimraf(buildPath(dirPathSegment));
  }

  // eslint-disable-next-line class-methods-use-this
  buildUrl(filePathSegment) {
    return `${sails.config.custom.baseUrl}/${filePathSegment.replace(PATH_SEGMENT_TO_URL_REPLACE_REGEX, '')}`;
  }
}

module.exports = LocalFileManager;
