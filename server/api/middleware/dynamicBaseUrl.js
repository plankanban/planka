const { URL } = require('url');

module.exports = (req, res, next) => {
  const { host } = req.headers;
  const forwardedHost = req.headers['x-forwarded-host'];
  const forwardedProto = req.headers['x-forwarded-proto'];

  const protocol = forwardedProto || req.protocol;
  const hostname = forwardedHost || host;

  if (hostname) {
    const baseUrl = new URL(`${protocol}://${hostname}`);
    sails.config.custom.baseUrl = baseUrl.origin;
    sails.config.custom.baseUrlPath = baseUrl.pathname;
    sails.config.custom.baseUrlSecure = baseUrl.protocol === 'https:';
    console.log(`Dynamic base URL set to: ${sails.config.custom.baseUrl}`);
  }

  next();
};
