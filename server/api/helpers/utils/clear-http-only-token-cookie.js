module.exports = {
  sync: true,

  inputs: {
    response: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    inputs.response.clearCookie('httpOnlyToken', {
      path: sails.config.custom.baseUrlPath,
    });
  },
};
