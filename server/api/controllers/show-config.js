module.exports = {
  fn() {
    const oidcClient = sails.hooks.oidc.isActive() ? sails.hooks.oidc.getClient() : null;
    return {
      item: {
        oidc:
          sails.config.custom.oidcIssuer !== ''
            ? {
                authorizationUrl: oidcClient.authorizationUrl({
                  scope: sails.config.custom.oidcScopes,
                  response_mode: 'fragment',
                }),
                endSessionUrl: oidcClient.issuer.end_session_endpoint
                  ? oidcClient.endSessionUrl({})
                  : null,
              }
            : null,
      },
    };
  },
};
