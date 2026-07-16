/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const path = require('path');

const SWAGGER_PATH = path.join(sails.config.appPath, 'swagger.json');

module.exports = {
  async fn() {
    if (!sails.config.custom.swaggerExposed) {
      return this.res.notFound();
    }

    let specification;
    try {
      const content = fs.readFileSync(SWAGGER_PATH, 'utf8');
      specification = JSON.parse(content);
    } catch (error) {
      sails.log.warn('swagger.json not found, run "npm run swagger:generate" to create it');
      return this.res.notFound();
    }

    return specification;
  },
};
