const AWS = require('aws-sdk');

class S3Client {
  constructor(options) {
    AWS.config.update({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: options.region,
    });
    this.bucket = options.bucket;
    this.client = new AWS.S3({
      endpoint: options.endpoint,
    });
  }

  upload({ Key, Body, ContentType }) {
    return this.client
      .upload({
        Bucket: this.bucket,
        Key,
        Body,
        ContentType,
        ACL: 'public-read',
      })
      .promise();
  }

  delete({ Key }) {
    return this.client
      .deleteObject({
        Bucket: this.bucket,
        Key,
      })
      .promise();
  }
}

module.exports = {
  fn() {
    if (sails.config.custom.s3Config) {
      return new S3Client(sails.config.custom.s3Config);
    }
    return null;
  },
};
