/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const net = require('net');

const LOCAL_IPV6_PREFIXES = ['fe8', 'fe9', 'fea', 'feb', 'fc', 'fd'];

const isPrivateIPv4 = (ip) => {
  const parts = ip.split('.').map((octet) => parseInt(octet, 10));

  if (parts.length !== 4 || parts.some((octet) => Number.isNaN(octet))) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 || // "this" network
    a === 10 ||
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64.0.0/10
    (a === 169 && b === 254) || // link-local
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168)
  );
};

const isPrivateIPv6 = (ip) => {
  const address = ip.toLowerCase();

  if (address === '::1' || address === '::') {
    return true;
  }

  // Link-local (fe80::/10) and unique-local (fc00::/7 -> fc/fd prefixes)
  if (LOCAL_IPV6_PREFIXES.some((prefix) => address.startsWith(prefix))) {
    return true;
  }

  // IPv4-mapped (::ffff:a.b.c.d), check the embedded IPv4
  const mapped = address.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);

  if (mapped) {
    return isPrivateIPv4(mapped[1]);
  }

  return false;
};

/**
 * Whether the address is private, loopback, link-local or otherwise internal.
 * @param {string} ip The IP address
 * @returns {boolean} True for internal and unrecognizable addresses
 */
const isPrivateAddress = (ip) => {
  const family = net.isIP(ip);

  if (family === 4) {
    return isPrivateIPv4(ip);
  }

  if (family === 6) {
    return isPrivateIPv6(ip);
  }

  return true; // not a recognizable IP
};

module.exports = {
  isPrivateIPv4,
  isPrivateIPv6,
  isPrivateAddress,
};
