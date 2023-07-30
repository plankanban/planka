const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  timeout: 30000, // Defaults to 30s
});

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidToken: {},
  },

  async fn(inputs) {
    let payload;
    const keys = await client.getSigningKeys();
    try {
      payload = jwt.verify(inputs.token, keys);
    } catch (error) {
      throw 'invalidToken';
    }

    return {
      subject: payload.sub,
      issuedAt: new Date(payload.iat * 1000),
    };
  },
};
