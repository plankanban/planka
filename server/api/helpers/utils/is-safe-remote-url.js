/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// SSRF guard for server-side fetches of user-supplied URLs (link previews).
// Rejects anything but http/https and any host that resolves to a private,
// loopback, link-local or otherwise-internal address — so a pasted
// `http://169.254.169.254/…` or `http://localhost:1337` can't reach the
// internal network. When an outgoing proxy is configured, egress policy is the
// proxy's responsibility and we defer to it.

const net = require('net');
const dns = require('dns').promises;
const { URL } = require('url');

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
    (a === 169 && b === 254) || // link-local (cloud metadata)
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168)
  );
};

const LOCAL_IPV6_PREFIXES = ['fe8', 'fe9', 'fea', 'feb', 'fc', 'fd'];

const isPrivateIPv6 = (ip) => {
  const address = ip.toLowerCase();
  if (address === '::1' || address === '::') {
    return true;
  }
  // Link-local (fe80::/10) and unique-local (fc00::/7 → fc/fd prefixes).
  if (LOCAL_IPV6_PREFIXES.some((prefix) => address.startsWith(prefix))) {
    return true;
  }
  // IPv4-mapped (::ffff:a.b.c.d) — check the embedded v4.
  const mapped = address.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) {
    return isPrivateIPv4(mapped[1]);
  }
  return false;
};

const isPrivateAddress = (ip) => {
  const family = net.isIP(ip);
  if (family === 4) {
    return isPrivateIPv4(ip);
  }
  if (family === 6) {
    return isPrivateIPv6(ip);
  }
  return true; // not a recognizable IP → treat as unsafe
};

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    let parsed;
    try {
      parsed = new URL(inputs.url);
    } catch (error) {
      return false;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    // Egress through a trusted proxy → let the proxy enforce destination policy.
    if (sails.config.custom.outgoingProxy) {
      return true;
    }

    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost')) {
      return false;
    }

    if (net.isIP(host)) {
      return !isPrivateAddress(host);
    }

    let addresses;
    try {
      addresses = await dns.lookup(host, { all: true });
    } catch (error) {
      return false;
    }

    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  },
};
