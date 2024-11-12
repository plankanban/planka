const util = require('util');
const { v4: uuid } = require('uuid');

async function doUpload(paramName, req, options) {
  const uploadOptions = {
    ...options,
    dirname: options.dirname || sails.config.custom.uploadsTempPath,
  };
  const upload = util.promisify((opts, callback) => {
    return req.file(paramName).upload(opts, (error, files) => callback(error, files));
  });
  return upload(uploadOptions);
}

module.exports = {
  friendlyName: 'Receive uploaded file from request',
  description:
    "Store a file uploaded from a MIME-multipart request part. The request part name must be 'file'; the resulting file will have a unique UUID-based name with the same extension.",
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

  fn: async function modFn(inputs, exits) {
    exits.success(
      await doUpload(inputs.paramName, inputs.req, {
        saveAs: uuid(),
        dirname: sails.config.custom.uploadsTempPath,
        maxBytes: null,
      }),
    );
  },
};
