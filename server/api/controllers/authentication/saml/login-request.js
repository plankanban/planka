const Errors = {
  INVALID_ID: {
    invalidId: 'Invalid authentication provider ID',
  },
  BAD_CONFIGURATION: {
    badConfiguration: 'Bad SAML configuration',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidId: {
      responseType: 'notFound',
    },
    badConfiguration: {
      responseType: 'serverError',
    },
  },

  async fn(inputs) {
    const { sp, idp } = await sails.helpers.saml.getConfig(inputs.id);

    const url = await new Promise((resolve, reject) => {
      sp.create_login_request_url(idp, {}, (err, loginUrl) => {
        if (err != null) {
          reject(Errors.BAD_CONFIGURATION);
        }
        resolve(loginUrl);
      });
    });

    return { item: url };
  },
};
