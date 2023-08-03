module.exports = {
  async fn() {
    const config = {
      authority: sails.config.custom.oidcIssuer,
      clientId: sails.config.custom.oidcClientId,
      redirectUri: sails.config.custom.oidcredirectUri,
    };
    return config;
  },
};