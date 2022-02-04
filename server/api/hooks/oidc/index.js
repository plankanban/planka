const openidClient = require('openid-client');

module.exports = function oidcServiceHook(sails) {

  let client = null;

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      if (sails.config.custom.oidcIssuer) {
        const issuer = await openidClient.Issuer.discover(sails.config.custom.oidcIssuer);

        client = new issuer.Client({
          client_id: sails.config.custom.oidcClientId,
          client_secret: sails.config.custom.oidcClientSecret,
          redirect_uris: [sails.config.custom.baseUrl + "/login"],
          response_types: ['code'],
          response_mode: ['fragment'],
        });
        sails.log.info('OIDC hook has been loaded successfully');
      }
    },

    getClient() {
      return client;
    },

    isActive() {
      return client !== null;
    }
  };
};
