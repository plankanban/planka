/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const path = require('path');

const PRELOADED_FAVICON_FILENAMES = fs
  .readdirSync(
    path.join(
      sails.config.custom.uploadsBasePath,
      sails.config.custom.preloadedFaviconsPathSegment,
    ),
  )
  .filter((filename) => filename.endsWith('.png'));

const PRELOADED_FAVICON_HOSTNAMES_SET = new Set(
  PRELOADED_FAVICON_FILENAMES.map((faviconFilename) => faviconFilename.slice(0, -4)),
);

module.exports = {
  sync: true,

  inputs: {
    hostname: {
      type: 'string',
      required: true,
    },
  },

  fn(inputs) {
    return PRELOADED_FAVICON_HOSTNAMES_SET.has(inputs.hostname);
  },
};
