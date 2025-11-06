/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const version = require('../version');

module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      version,
      title: 'PLANKA API',
      description:
        'API documentation for PLANKA - Real-Time Collaborative Kanban Board Application',
      license: {
        name: 'Fair Use License',
        url: 'https://github.com/plankanban/planka/blob/master/LICENSE.md',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Base path for API endpoints',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        apiKeyAuth: [],
      },
    ],
  },
  apis: ['./api/controllers/**/*.js', './api/models/*.js', './api/responses/*.js'],
};
