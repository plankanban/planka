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
      if (!this.isActive()) {
        return;
      }

      sails.log.info('Initializing custom hook (`oidc`)');
    },

    async getClient() {
      if (client === null && this.isActive()) {
        sails.log.info('Initializing OIDC client');

        const issuer = await openidClient.Issuer.discover(sails.config.custom.oidcIssuer);

        const metadata = {
          client_id: sails.config.custom.oidcClientId,
          client_secret: sails.config.custom.oidcClientSecret,
          redirect_uris: [sails.config.custom.oidcRedirectUri],
          response_types: ['code'],
          userinfo_signed_response_alg: sails.config.custom.oidcUserinfoSignedResponseAlg,
        };

        if (sails.config.custom.oidcIdTokenSignedResponseAlg) {
          metadata.id_token_signed_response_alg = sails.config.custom.oidcIdTokenSignedResponseAlg;
        }

        client = new issuer.Client(metadata);
      }

      return client;
    },

    isActive() {
      return sails.config.custom.oidcIssuer !== undefined;
    },
  };
};
