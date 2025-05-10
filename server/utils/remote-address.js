/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * The IP address of the client that just made a request to this application, whether
 * or not the TRUST_PROXY env variable is true and if endpoint accessed through a proxy.
 * @param {Request} request The endpoint Request object
 * @returns The IP address of the client that just made a request
 */
const getRemoteAddress = (request) => {
  let remoteAddress = request.ip;

  // Assert if "X-Forwarded-For" header contains any addresses
  if (process.env.TRUST_PROXY === 'true' && !_.isEmpty(request.ips)) {
    // eslint-disable-next-line prefer-destructuring
    remoteAddress = request.ips[0];
  }

  // Convert address from IPV6 to IPV4 if client device is IPV4.
  const defaultIPV6Regex = /^::ffff:((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/g;
  if (remoteAddress.match(defaultIPV6Regex)) {
    remoteAddress = remoteAddress.replace('::ffff:', '');
  }

  return remoteAddress;
};

module.exports = {
  getRemoteAddress,
};
