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
  },

  async fn(inputs) {
    const { sp } = await sails.helpers.saml.getConfig(inputs.id);

    this.res.setHeader('Content-Type', 'text/xml');

    return sp.create_metadata();
  },
};
