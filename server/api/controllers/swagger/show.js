/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const path = require('path');

let cachedSpecification;

module.exports = {
  async fn() {
    if (!sails.config.custom.swaggerEnabled) {
      return this.res.notFound();
    }

    if (!cachedSpecification) {
      const swaggerPath = path.join(sails.config.appPath, 'swagger.json');

      try {
        const content = fs.readFileSync(swaggerPath, 'utf8');
        cachedSpecification = JSON.parse(content);
      } catch (error) {
        sails.log.warn(
          'swagger.json not found, run "npm run swagger:generate" or "npm run build" to create it',
        );
        return this.res.notFound();
      }
    }

    return this.res.json(cachedSpecification);
  },
};
