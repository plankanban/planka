module.exports = {
  fn() {
    return {
      item: {
        oidc: sails.config.custom.oidcIssuer
          ? {
              issuer: sails.config.custom.oidcIssuer,
              clientId: sails.config.custom.oidcClientId,
              redirectUri: sails.config.custom.oidcRedirectUri,
              scopes: sails.config.custom.oidcScopes,
            }
          : null,
      },
    };
  },
};
