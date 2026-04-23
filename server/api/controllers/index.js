/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const path = require('path');

const getDevelopmentClientUrl = (req) => {
  const protocol = req.protocol || 'http';
  const host = req.headers.host || 'localhost:1337';
  const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`);

  url.port = process.env.CLIENT_PORT || '3000';

  return url.toString();
};

module.exports = {
  fn() {
    const viewPath = path.join(sails.config.paths.views, 'index.ejs');

    if (fs.existsSync(viewPath)) {
      return this.res.view('index', {
        basePath: sails.config.custom.baseUrlPath,
      });
    }

    return this.res.redirect(getDevelopmentClientUrl(this.req));
  },
};
