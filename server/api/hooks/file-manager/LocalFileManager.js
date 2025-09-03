/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
  async read(filePathSegment) {
    const filePath = buildPath(filePathSegment);
    const isFileExists = await fse.pathExists(filePath);

    if (!isFileExists) {
      throw new Error('File does not exist');
    }

    return fs.createReadStream(filePath);
  }

  // eslint-disable-next-line class-methods-use-this
  async getSize(filePathSegment) {
    let result;
    try {
      result = await fs.promises.stat(buildPath(filePathSegment));
    } catch (error) {
      return null;
    }

    return result.size;
  }

  // eslint-disable-next-line class-methods-use-this
  async rename(filePathSegment, nextFilePathSegment) {
    try {
      await fs.promises.rename(buildPath(filePathSegment), buildPath(nextFilePathSegment));
    } catch (error) {
      /* empty */
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async delete(filePathSegment) {
    try {
      await fs.promises.unlink(buildPath(filePathSegment));
    } catch (error) {
      /* empty */
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async listDir(dirPathSegment) {
    let dirents;
    try {
      dirents = await fs.promises.readdir(buildPath(dirPathSegment), {
        withFileTypes: true,
      });
    } catch (error) {
      return null;
    }

    return dirents.flatMap((dirent) => (dirent.isDirectory() ? dirent.name : []));
  }

  // eslint-disable-next-line class-methods-use-this
  async renameDir(dirPathSegment, nextDirPathSegment) {
    try {
      await fs.promises.rename(buildPath(dirPathSegment), buildPath(nextDirPathSegment));
    } catch (error) {
      /* empty */
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async deleteDir(dirPathSegment) {
    await rimraf(buildPath(dirPathSegment));
  }

  // eslint-disable-next-line class-methods-use-this
  async isExists(pathSegment) {
    return fse.pathExists(buildPath(pathSegment));
  }

  // eslint-disable-next-line class-methods-use-this
  buildUrl(filePathSegment) {
    return `${sails.config.custom.baseUrl}/${filePathSegment.replace(PATH_SEGMENT_TO_URL_REPLACE_REGEX, '')}`;
  }
}

module.exports = LocalFileManager;
