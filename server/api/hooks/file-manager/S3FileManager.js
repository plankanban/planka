/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const mime = require('mime-types');
const {
  CopyObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

class S3FileManager {
  constructor(client) {
    this.client = client;
  }

  async move(sourceFilePath, filePathSegment, contentType) {
    const command = new PutObjectCommand({
      Bucket: sails.config.custom.s3Bucket,
      Key: filePathSegment,
      Body: fs.createReadStream(sourceFilePath),
      ContentType: contentType,
    });

    await this.client.send(command);
    return null;
  }

  async save(filePathSegment, stream, contentType) {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: sails.config.custom.s3Bucket,
        Key: filePathSegment,
        Body: stream,
        ContentType: contentType,
      },
    });

    await upload.done();
  }

  async read(filePathSegment, { withHeaders = false } = {}) {
    const command = new GetObjectCommand({
      Bucket: sails.config.custom.s3Bucket,
      Key: filePathSegment,
    });

    const result = await this.client.send(command);

    if (withHeaders) {
      const headers = {
        'Content-Type':
          result.ContentType || mime.lookup(filePathSegment) || 'application/octet-stream',
        'Accept-Ranges': result.AcceptRanges || 'bytes',
      };

      if (!_.isUndefined(result.ContentLength)) {
        headers['Content-Length'] = result.ContentLength;
      }

      if (!_.isUndefined(result.LastModified)) {
        headers['Last-Modified'] = result.LastModified.toUTCString();
      }

      if (_.isUndefined(result.ETag)) {
        if (!_.isUndefined(result.ContentLength) && !_.isUndefined(result.LastModified)) {
          headers.ETag = `W/"${result.ContentLength.toString(16)}-${result.LastModified.getTime().toString(16)}"`;
        }
      } else {
        headers.ETag = result.ETag;
      }

      return [result.Body, headers];
    }

    return result.Body;
  }

  async getSize(filePathSegment) {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: sails.config.custom.s3Bucket,
      Key: filePathSegment,
    });

    let result;
    try {
      result = await this.client.send(headObjectCommand);
    } catch (error) {
      return null;
    }

    return result.ContentLength;
  }

  async rename(filePathSegment, nextFilePathSegment) {
    const copyObjectCommand = new CopyObjectCommand({
      Bucket: sails.config.custom.s3Bucket,
      Key: nextFilePathSegment,
      CopySource: `${sails.config.custom.s3Bucket}/${filePathSegment}`,
    });

    try {
      await this.client.send(copyObjectCommand);
    } catch (error) {
      return;
    }

    await this.delete(filePathSegment);
  }

  async delete(filePathSegment) {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: sails.config.custom.s3Bucket,
      Key: filePathSegment,
    });

    await this.client.send(deleteObjectCommand);
  }

  async listDir(dirPathSegment, { ContinuationToken } = {}) {
    const listObjectsCommand = new ListObjectsV2Command({
      ContinuationToken,
      Bucket: sails.config.custom.s3Bucket,
      Prefix: `${dirPathSegment}/`,
      Delimiter: '/',
    });

    const result = await this.client.send(listObjectsCommand);

    if (!result.CommonPrefixes) {
      return null;
    }

    const dirnames = result.CommonPrefixes.map(({ Prefix }) =>
      Prefix.slice(dirPathSegment.length + 1, -1),
    );

    if (result.IsTruncated) {
      const otherDirnames = await this.listDir(dirPathSegment, {
        ContinuationToken: result.NextContinuationToken,
      });

      if (otherDirnames) {
        dirnames.push(...otherDirnames);
      }
    }

    return dirnames;
  }

  async renameDir(dirPathSegment, nextDirPathSegment, { ContinuationToken } = {}) {
    const listObjectsCommand = new ListObjectsV2Command({
      ContinuationToken,
      Bucket: sails.config.custom.s3Bucket,
      Prefix: dirPathSegment,
    });

    const result = await this.client.send(listObjectsCommand);

    if (!result.Contents) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const { Key } of result.Contents) {
      // eslint-disable-next-line no-await-in-loop
      await this.rename(Key, `${nextDirPathSegment}/${Key.substring(dirPathSegment.length + 1)}`);
    }

    if (result.IsTruncated) {
      await this.renameDir(dirPathSegment, nextDirPathSegment, {
        ContinuationToken: result.NextContinuationToken,
      });
    }
  }

  async deleteDir(dirPathSegment, { ContinuationToken } = {}) {
    const listObjectsCommand = new ListObjectsV2Command({
      ContinuationToken,
      Bucket: sails.config.custom.s3Bucket,
      Prefix: dirPathSegment,
    });

    const result = await this.client.send(listObjectsCommand);

    if (!result.Contents) {
      return;
    }

    if (result.Contents.length > 0) {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: sails.config.custom.s3Bucket,
        Delete: {
          Objects: result.Contents.map(({ Key }) => ({ Key })),
        },
      });

      await this.client.send(deleteObjectsCommand);
    }

    if (result.IsTruncated) {
      await this.deleteDir(dirPathSegment, {
        ContinuationToken: result.NextContinuationToken,
      });
    }
  }

  async isExists(pathSegment) {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: sails.config.custom.s3Bucket,
      Prefix: pathSegment,
      MaxKeys: 1,
    });

    const result = await this.client.send(listObjectsCommand);
    return !!result.Contents && result.Contents.length === 1;
  }

  /* // eslint-disable-next-line class-methods-use-this
  buildUrl(filePathSegment) {
    return `${sails.hooks.s3.getBaseUrl()}/${filePathSegment}`;
  } */
}

module.exports = S3FileManager;
