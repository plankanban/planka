/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const util = require('util');
const { v4: uuid } = require('uuid');

module.exports = {
  friendlyName: 'Receive uploaded file from request',

  description:
    'Store a file uploaded from a MIME-multipart request part. The resulting file will have a unique UUID-based name with the same extension.',

  inputs: {
    paramName: {
      type: 'string',
      required: true,
      description: 'The MIME multi-part parameter containing the file to receive.',
    },
    req: {
      type: 'ref',
      required: true,
      description: 'The request to receive the file from.',
    },
  },

  async fn(inputs, exits) {
    const upload = util.promisify((options, callback) =>
      inputs.req.file(inputs.paramName).upload(options, (error, files) => callback(error, files)),
    );

    return exits.success(
      await upload({
        dirname: sails.config.custom.uploadsTempPath,
        saveAs: uuid(),
        maxBytes: null,
      }),
    );
  },
};
