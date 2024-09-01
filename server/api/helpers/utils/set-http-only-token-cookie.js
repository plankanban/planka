module.exports = {
  sync: true,

  inputs: {
    value: {
      type: 'string',
      required: true,
    },
    accessTokenPayload: {
      type: 'json',
      required: true,
    },
    response: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    inputs.response.cookie('httpOnlyToken', inputs.value, {
      expires: new Date(inputs.accessTokenPayload.exp * 1000),
      path: sails.config.custom.baseUrlPath,
      secure: sails.config.custom.baseUrlSecure,
      httpOnly: true,
      sameSite: 'strict',
    });
  },
};
