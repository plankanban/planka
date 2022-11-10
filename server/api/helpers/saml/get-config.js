const saml2 = require('saml2-js');

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidId: {},
  },

  async fn(inputs) {
    for (let i = 0, l = sails.config.custom.samlConfig.length; i < l; i += 1) {
      const config = sails.config.custom.samlConfig[i];
      if (config.id === inputs.id) {
        return {
          sp: new saml2.ServiceProvider(config.sp),
          idp: new saml2.IdentityProvider(config.idp),
          bindings: config.bindings,
        };
      }
    }

    throw 'invalidId';
  },
};
