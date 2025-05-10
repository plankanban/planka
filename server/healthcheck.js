/* eslint-disable no-console */

const http = require('http');

const options = {
  host: 'localhost',
  port: 1337,
  timeout: 2000,
};

const healthcheck = http.request(options, ({ statusCode }) => {
  console.log(`HEALTHCHECK STATUS: ${statusCode}`);
  process.exit(statusCode === 200 ? 0 : 1);
});

healthcheck.on('error', () => {
  console.error('HEALTHCHECK ERROR');
  process.exit(1);
});

healthcheck.end();
