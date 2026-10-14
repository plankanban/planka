const { once } = require('events');
const { Readable, Writable } = require('stream');
const { expect } = require('chai');
const sails = require('sails');
const { routes } = require('../../config/routes');

describe('static cache control', () => {
  let originalConfig;
  let originalHooks;
  let originalHelpers;

  beforeEach(() => {
    originalConfig = sails.config;
    originalHooks = sails.hooks;
    originalHelpers = sails.helpers;
  });

  afterEach(() => {
    sails.config = originalConfig;
    sails.hooks = originalHooks;
    sails.helpers = originalHelpers;
  });

  it('writes the configured millisecond cache duration as max-age seconds', async () => {
    const responseHeaders = {};
    const response = new Writable({
      write(chunk, encoding, callback) {
        callback();
      },
    });

    response.set = (headers) => {
      Object.assign(responseHeaders, headers);
      return response;
    };

    sails.config = {
      custom: { backgroundImagesPathSegment: 'background-images' },
      http: { cache: 365.25 * 24 * 60 * 60 * 1000 },
    };
    sails.hooks = {
      'file-manager': {
        getInstance: () => ({
          read: async () => [Readable.from('image'), { 'Content-Type': 'image/png' }],
        }),
      },
    };
    sails.helpers = {
      utils: {
        resolveAccessToken: { with: async () => ({ user: {} }) },
      },
    };

    const finished = once(response, 'finish');

    await routes['GET /background-images/*'].fn(
      {
        cookies: { accessToken: 'token' },
        url: '/background-images/example.png',
      },
      response,
    );
    await finished;

    expect(responseHeaders['Cache-Control']).to.equal('private, max-age=31557600, immutable');
  });
});
