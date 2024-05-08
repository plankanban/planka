const openidClient = require('openid-client');

/**
 * oidc hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineOidcHook(sails) {
  let client = null;

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      if (!sails.config.custom.oidcIssuer) {
        return;
      }

      sails.log.info('Initializing custom hook (`oidc`)');

      const issuer = await openidClient.Issuer.discover(sails.config.custom.oidcIssuer);

      client = new issuer.Client({
        client_id: sails.config.custom.oidcClientId,
        client_secret: sails.config.custom.oidcClientSecret,
        redirect_uris: [sails.config.custom.oidcRedirectUri],
        response_types: ['code'],
      });
    },

    getClient() {
      return client;
    },

    isActive() {
      return client !== null;
    },
  };
};
