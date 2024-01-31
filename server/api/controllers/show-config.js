module.exports = {
  fn() {
    let oidc = null;
    if (sails.hooks.oidc.isActive()) {
      const oidcClient = sails.hooks.oidc.getClient();

      oidc = {
        authorizationUrl: oidcClient.authorizationUrl({
          scope: sails.config.custom.oidcScopes,
          response_mode: 'fragment',
        }),
        endSessionUrl: oidcClient.issuer.end_session_endpoint ? oidcClient.endSessionUrl({}) : null,
        isEnforced: sails.config.custom.oidcEnforced,
      };
    }

    return {
      item: {
        oidc,
      },
    };
  },
};
