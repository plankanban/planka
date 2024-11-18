const Errors = {
  INVALID_OIDC_CONFIGURATION: {
    invalidOidcConfiguration: 'Invalid OIDC configuration',
  },
};

module.exports = {
  exits: {
    invalidOidcConfiguration: {
      responseType: 'serverError',
    },
  },

  async fn() {
    let oidc = null;
    if (sails.hooks.oidc.isActive()) {
      let oidcClient;
      try {
        oidcClient = await sails.hooks.oidc.getClient();
      } catch (error) {
        sails.log.warn(`Error while initializing OIDC client: ${error}`);
        throw Errors.INVALID_OIDC_CONFIGURATION;
      }

      const authorizationUrlParams = {
        scope: sails.config.custom.oidcScopes,
      };

      if (!sails.config.custom.oidcUseDefaultResponseMode) {
        authorizationUrlParams.response_mode = sails.config.custom.oidcResponseMode;
      }

      oidc = {
        authorizationUrl: oidcClient.authorizationUrl(authorizationUrlParams),
        endSessionUrl: oidcClient.issuer.end_session_endpoint ? oidcClient.endSessionUrl({}) : null,
        isEnforced: sails.config.custom.oidcEnforced,
      };
    }

    return {
      item: {
        oidc,
        allowAllToCreateProjects: sails.config.custom.allowAllToCreateProjects,
      },
    };
  },
};
