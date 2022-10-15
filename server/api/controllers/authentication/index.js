module.exports = {
  async fn() {
    return {
      local: sails.config.custom.localAuth,
      saml: sails.config.custom.samlConfig.map((config) => _.pick(config, ['id', 'name'])),
    };
  },
};
