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
const { isPrivateAddress } = require('../../../utils/ip-address');

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
