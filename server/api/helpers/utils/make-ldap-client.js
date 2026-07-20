/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const crypto = require('crypto');
const net = require('net');
const ldap = require('ldapjs');
const { Client: SshClient } = require('ssh2');

const { bind, unbind } = require('../../../utils/ldap');

const makeSshHostKeyVerifier = (expectedFingerprint) => (key) => {
  const actualFingerprint = crypto.createHash('sha256').update(key).digest('hex');

  return (
    actualFingerprint.length === expectedFingerprint.length &&
    crypto.timingSafeEqual(Buffer.from(actualFingerprint), Buffer.from(expectedFingerprint))
  );
};

const openSshTunnel = (config) =>
  new Promise((resolve, reject) => {
    const expectedFingerprint = (config.ldapSshHostKeyFingerprint || '')
      .replace(/[^a-f0-9]/gi, '')
      .toLowerCase();

    if (!expectedFingerprint) {
      reject(
        new Error(
          'SSH host key fingerprint is not configured. Set it before enabling the SSH tunnel, otherwise the connection cannot be verified and is vulnerable to man-in-the-middle attacks.',
        ),
      );
      return;
    }

    const sshClient = new SshClient();

    sshClient.on('ready', () => {
      const localServer = net.createServer((socket) => {
        sshClient.forwardOut(
          socket.remoteAddress,
          socket.remotePort,
          config.ldapSshRemoteHost,
          config.ldapSshRemotePort,
          (error, stream) => {
            if (error) {
              socket.destroy();
              return;
            }

            socket.pipe(stream).pipe(socket);

            socket.on('error', () => stream.destroy());
            stream.on('error', () => socket.destroy());
          },
        );
      });

      localServer.once('error', (error) => {
        sshClient.end();
        reject(error);
      });

      localServer.listen(0, '127.0.0.1', () => {
        resolve({ sshClient, localServer, localPort: localServer.address().port });
      });
    });

    sshClient.once('error', reject);

    sshClient.connect({
      host: config.ldapSshHost,
      port: config.ldapSshPort || 22,
      username: config.ldapSshUsername,
      password: config.ldapSshPassword,
      readyTimeout: 10000,
      hostVerifier: makeSshHostKeyVerifier(expectedFingerprint),
    });
  });

module.exports = {
  async fn() {
    const config = await Config.qm.getOneMain();

    if (!config.ldapEnabled) {
      return {
        config,
        client: null,
        close: async () => {},
      };
    }

    let sshClient = null;
    let localServer = null;

    let { ldapHost: host, ldapPort: port } = config;
    if (!port) {
      port = config.ldapTls ? 636 : 389;
    }

    if (config.ldapSshTunnelEnabled) {
      const tunnel = await openSshTunnel(config);

      sshClient = tunnel.sshClient;
      localServer = tunnel.localServer;
      host = '127.0.0.1';
      port = tunnel.localPort;
    }

    const client = ldap.createClient({
      url: `${config.ldapTls ? 'ldaps' : 'ldap'}://${host}:${port}`,
      timeout: 10000,
      connectTimeout: 10000,
      tlsOptions: config.ldapTls
        ? {
            rejectUnauthorized: true,
            servername: config.ldapHost,
          }
        : undefined,
    });

    // Prevent background socket errors (e.g. after we are done) from crashing the process
    client.on('error', () => {});

    const close = async () => {
      await unbind(client);

      if (localServer) {
        localServer.close();
      }

      if (sshClient) {
        sshClient.end();
      }
    };

    try {
      await bind(client, config.ldapBindDn, config.ldapBindPassword);
    } catch (error) {
      await close();
      throw error;
    }

    return {
      config,
      client,
      close,
    };
  },
};
