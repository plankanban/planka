/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * oidc hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

const openidClient = require('openid-client');

module.exports = function defineOidcHook(sails) {
  let client = null;

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */
    async initialize() {
      if (!this.isEnabled()) {
        return;
      }

      sails.log.info('Initializing custom hook (`oidc`)');
    },

    // TODO: wait for initialization if called more than once
    async getClient() {
      if (this.isEnabled() && !this.isActive()) {
        sails.log.info('Initializing OIDC client');

        let issuer;
        try {
          issuer = await openidClient.Issuer.discover(sails.config.custom.oidcIssuer);
        } catch (error) {
          sails.log.warn(`Error while initializing OIDC client: ${error}`);
          return null;
        }

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

    async getBootstrap() {
      const instance = await this.getClient();

      if (!instance) {
        return null;
      }

      const authorizationUrlParams = {
        scope: sails.config.custom.oidcScopes,
      };

      if (!sails.config.custom.oidcUseDefaultResponseMode) {
        authorizationUrlParams.response_mode = sails.config.custom.oidcResponseMode;
      }

      return {
        authorizationUrl: instance.authorizationUrl(authorizationUrlParams),
        endSessionUrl: instance.issuer.end_session_endpoint ? instance.endSessionUrl({}) : null,
        isEnforced: sails.config.custom.oidcEnforced,
      };
    },

    isEnabled() {
      return !!sails.config.custom.oidcIssuer;
    },

    isActive() {
      return client !== null;
    },
  };
};
