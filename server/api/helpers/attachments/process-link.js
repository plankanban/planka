/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { URL } = require('url');

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { hostname } = new URL(inputs.url);

    // The link itself is only a stored string and stays whatever the user
    // typed. Fetching its favicon, though, is a request the SERVER makes to an
    // address the user chose — without a guard an editor could aim it at
    // `169.254.169.254` or an internal service and read the outcome from
    // whether an icon appeared.
    const isSafe = await sails.helpers.utils.isSafeRemoteUrl(inputs.url);

    if (isSafe && !sails.helpers.utils.isPreloadedFaviconExists(hostname)) {
      await sails.helpers.utils.downloadFavicon(inputs.url);
    }

    return {
      hostname,
      url: inputs.url,
    };
  },
};
