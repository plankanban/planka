const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const swaggerJsdoc = require('swagger-jsdoc');

const config = require('./config/swagger');

const specification = swaggerJsdoc(config);
fs.writeFileSync('swagger.json', JSON.stringify(specification, null, 2));
