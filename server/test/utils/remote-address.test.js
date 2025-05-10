const { expect } = require('chai');
const { getRemoteAddress } = require('../../utils/remote-address');

/**
 * Fake HTTP request object
 * given to all api controllers.
 */
const MOCK_REQUEST = {
  ip: '',
  ips: [],
};

/**
 * Mocks the `MOCK_REQUEST` value.
 * Should be called before asserting `getRemoteAddress`.
 * @param {string} ip Mock remote IP address
 * @param {any[]} ips Mock array of proxy IP addresses
 */
const mockRequest = (ip, ips) => {
  MOCK_REQUEST.ip = ip;
  MOCK_REQUEST.ips = ips;
};

/**
 * Mocks the `TRUST_PROXY` environment variable passed through `docker-compose` file.
 * @param {boolean} trustProxy Whether the TRUST_PROXY environment variable was enabled.
 */
const mockProxyFlag = (trustProxy) => {
  process.env.TRUST_PROXY = trustProxy.toString();
};

describe('remote-address', () => {
  describe('#getRemoteAddress(Request)', () => {
    it('should get IPv4 remote address while not behind proxy and TRUST_PROXY=false', async () => {
      const expectedAddress = '172.2.109.132';

      mockRequest(`::ffff:${expectedAddress}`, null);
      mockProxyFlag(false);

      expect(getRemoteAddress(MOCK_REQUEST)).to.be.equal(expectedAddress);
    });

    it('should get IPv6 remote address while not behind proxy and TRUST_PROXY=false', async () => {
      const expectedAddress = 'f53f:5832:9f1c:fe38:ce3d:1be8:81a2:115e';

      mockRequest(expectedAddress, null);
      mockProxyFlag(false);

      expect(getRemoteAddress(MOCK_REQUEST)).to.be.equal(expectedAddress);
    });

    it('should get IPv4 remote address while behind proxy and TRUST_PROXY=true', async () => {
      const expectedAddress = '172.2.109.132';

      mockRequest(`::ffff:${expectedAddress}`, [
        `::ffff:${expectedAddress}`,
        '::ffff:192.182.23.111',
        '::ffff:120.210.132.14',
      ]);
      mockProxyFlag(true);

      expect(getRemoteAddress(MOCK_REQUEST)).to.be.equal(expectedAddress);
    });

    it('should get IPv6 remote address while behind proxy and TRUST_PROXY=true', async () => {
      const expectedAddress = 'f53f:5832:9f1c:fe38:ce3d:1be8:81a2:115e';

      mockRequest(expectedAddress, [
        expectedAddress,
        '9d74:fb18:3b95:801f:8751:8d18:8207:b322',
        '598e:4291:e1b3:2991:5d17:00af:1b6b:802c',
      ]);
      mockProxyFlag(true);

      expect(getRemoteAddress(MOCK_REQUEST)).to.be.equal(expectedAddress);
    });
  });
});
