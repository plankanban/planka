const http = require('http');
const { expect } = require('chai');

const { isPrivateAddress } = require('../../utils/ip-address');

describe('ip-address', () => {
  describe('#isPrivateAddress(string)', () => {
    [
      '0.0.0.0',
      '10.0.0.1',
      '127.0.0.1',
      '127.255.255.254',
      '100.64.0.1',
      '100.127.255.255',
      '169.254.169.254',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.1',
      '::',
      '::1',
      'fe80::1',
      'febf::1',
      'fc00::1',
      'fd12:3456::1',
      '::ffff:127.0.0.1',
      '::ffff:10.1.2.3',
      'not-an-ip',
      '',
    ].forEach((address) => {
      it(`treats ${JSON.stringify(address)} as private`, () => {
        expect(isPrivateAddress(address)).to.be.equal(true);
      });
    });

    [
      '8.8.8.8',
      '1.1.1.1',
      '100.63.255.255',
      '100.128.0.1',
      '169.253.1.1',
      '172.15.255.255',
      '172.32.0.1',
      '192.167.1.1',
      '2606:4700:4700::1111',
      'fec0::1',
      '::ffff:8.8.8.8',
    ].forEach((address) => {
      it(`treats ${address} as public`, () => {
        expect(isPrivateAddress(address)).to.be.equal(false);
      });
    });
  });
});

describe('download-favicon request targets', () => {
  const servers = [];
  let originalIsSafeRemoteUrl;
  let originalProxy;
  let allowedOrigin;

  const listen = (handler) =>
    new Promise((resolve) => {
      const hits = [];
      const server = http.createServer((request, response) => {
        hits.push(request.url);
        handler(request, response);
      });

      servers.push(server);
      server.listen(0, '127.0.0.1', () => {
        resolve({ hits, origin: `http://127.0.0.1:${server.address().port}` });
      });
    });

  before(() => {
    originalIsSafeRemoteUrl = sails.helpers.utils.isSafeRemoteUrl;
    originalProxy = sails.config.custom.outgoingProxy;

    // Local servers are internal, so only the page origin is let through
    sails.config.custom.outgoingProxy = undefined;
    sails.helpers.utils.isSafeRemoteUrl = async (url) => new URL(url).origin === allowedOrigin;
  });

  after(() => {
    sails.helpers.utils.isSafeRemoteUrl = originalIsSafeRemoteUrl;
    sails.config.custom.outgoingProxy = originalProxy;

    servers.forEach((server) => server.close());
  });

  it('does not follow a redirect to an internal address', async () => {
    const internal = await listen((request, response) => response.end('internal'));

    const page = await listen((request, response) => {
      response.writeHead(302, { Location: `${internal.origin}/secret` });
      response.end();
    });

    allowedOrigin = page.origin;
    await sails.helpers.utils.downloadFavicon(page.origin);

    expect(page.hits).to.deep.equal(['/']);
    expect(internal.hits).to.deep.equal([]);
  });

  it('does not request a favicon that points to an internal address', async () => {
    const internal = await listen((request, response) => response.end('internal'));

    const page = await listen((request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(`<link rel="icon" href="${internal.origin}/favicon.png">`);
    });

    allowedOrigin = page.origin;
    await sails.helpers.utils.downloadFavicon(page.origin);

    expect(page.hits).to.deep.equal(['/']);
    expect(internal.hits).to.deep.equal([]);
  });

  it('does not request a favicon reached by a redirect to an internal address', async () => {
    const internal = await listen((request, response) => response.end('internal'));

    const page = await listen((request, response) => {
      if (request.url === '/') {
        response.end('<html></html>');
        return;
      }

      response.writeHead(301, { Location: `${internal.origin}/favicon.ico` });
      response.end();
    });

    allowedOrigin = page.origin;
    await sails.helpers.utils.downloadFavicon(page.origin);

    expect(page.hits).to.deep.equal(['/', '/favicon.ico']);
    expect(internal.hits).to.deep.equal([]);
  });

  it('stops following redirects after a limited number of hops', async () => {
    const page = await listen((request, response) => {
      response.writeHead(302, { Location: '/again' });
      response.end();
    });

    allowedOrigin = page.origin;
    await sails.helpers.utils.downloadFavicon(page.origin);

    expect(page.hits.length).to.be.equal(6);
  });
});
