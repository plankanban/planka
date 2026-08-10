/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { pipeline } = require('stream/promises');
const mime = require('mime-types');
const { rimraf } = require('rimraf');

// const PATH_SEGMENT_TO_URL_REPLACE_REGEX = /(public|private)\//;

// Reject a path unless it is the uploads root itself or lives strictly
// beneath it. Callers must pass an already-absolute path.
const assertWithinRoot = (rootPath, filePath) => {
  if (filePath !== rootPath && !filePath.startsWith(`${rootPath}${path.sep}`)) {
    throw new Error('Path is outside of the uploads directory');
  }
};

const buildPath = (pathSegment) => {
  const { uploadsBasePath } = sails.config.custom;
  const filePath = path.resolve(uploadsBasePath, pathSegment);

  // Ensure the resolved path stays within the uploads root, so that
  // attacker-controlled path segments (e.g. `../`) cannot escape it.
  assertWithinRoot(uploadsBasePath, filePath);

  return filePath;
};

class LocalFileManager {
  // eslint-disable-next-line class-methods-use-this
  async move(sourceFilePath, filePathSegment) {
    const { dir, base } = path.parse(filePathSegment);

    const dirPath = buildPath(dir);
    const filePath = path.join(dirPath, base);

    await fs.promises.mkdir(dirPath, { recursive: true });
    await fse.move(sourceFilePath, filePath);

    return filePath;
  }

  // eslint-disable-next-line class-methods-use-this
  async save(filePathSegment, stream) {
    const filePath = buildPath(filePathSegment);
    const { dir: dirPath } = path.parse(filePath);

    await fs.promises.mkdir(dirPath, { recursive: true });
    await pipeline(stream, fs.createWriteStream(filePath));
  }

  // eslint-disable-next-line class-methods-use-this
  async read(filePathSegment, { withHeaders = false } = {}) {
    const filePath = buildPath(filePathSegment);

    // Resolve symlinks and re-check containment, so that a symlink placed
    // inside the uploads root cannot be used to read files outside of it.
    let realFilePath;
    try {
      realFilePath = await fs.promises.realpath(filePath);
    } catch (error) {
      throw new Error('File does not exist');
    }
    const realBasePath = await fs.promises.realpath(sails.config.custom.uploadsBasePath);
    assertWithinRoot(realBasePath, realFilePath);

    let stat;
    try {
      stat = await fs.promises.stat(realFilePath);
    } catch (error) {
      throw new Error('File does not exist');
    }

    const readStream = fs.createReadStream(realFilePath);

    if (withHeaders) {
      return [
        readStream,
        {
          'Content-Type': mime.lookup(filePathSegment) || 'application/octet-stream',
          'Content-Length': stat.size,
          'Last-Modified': stat.mtime.toUTCString(),
          ETag: `W/"${stat.size.toString(16)}-${stat.mtime.getTime().toString(16)}"`,
          'Accept-Ranges': 'bytes',
        },
      ];
    }

    return readStream;
  }

  // eslint-disable-next-line class-methods-use-this
  async getSize(filePathSegment) {
    let stat;
    try {
      stat = await fs.promises.stat(buildPath(filePathSegment));
    } catch (error) {
      return null;
    }

    return stat.size;
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

  /* // eslint-disable-next-line class-methods-use-this
  buildUrl(filePathSegment) {
    return `${sails.config.custom.baseUrl}/${filePathSegment.replace(PATH_SEGMENT_TO_URL_REPLACE_REGEX, '')}`;
  } */
}

module.exports = LocalFileManager;
