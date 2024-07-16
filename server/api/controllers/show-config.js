module.exports = {
  fn() {
    let oidc = null;
    if (sails.hooks.oidc.isActive()) {
      const oidcClient = sails.hooks.oidc.getClient();

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
