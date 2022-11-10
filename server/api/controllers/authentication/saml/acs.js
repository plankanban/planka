const { getRemoteAddress } = require('../../../../utils/remoteAddress');

const Errors = {
  INVALID_ID: {
    invalidId: 'Invalid authentication provider ID',
  },
  BAD_SAML_RESPONSE: {
    badSAMLResponse: 'Bad SAML response',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    SAMLResponse: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidId: {
      responseType: 'notFound',
    },
    badSAMLResponse: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { sp, idp, bindings } = await sails.helpers.saml.getConfig(inputs.id);

    const options = { request_body: { SAMLResponse: inputs.SAMLResponse } };

    const response = await new Promise((resolve, reject) => {
      sp.post_assert(idp, options, (err, res) => {
        if (err !== null) {
          reject(Errors.BAD_SAML_RESPONSE);
          return;
        }
        resolve(res);
      });
    });

    let user = await sails.helpers.users.getOne({
      ssoId: inputs.id,
      ssoName: response.user.name_id,
    });

    const values = await sails.helpers.saml.parseAttributes(bindings, response.user.attributes);

    if (user === undefined) {
      Object.assign(values, { ssoId: inputs.id, ssoName: response.user.name_id });
      user = await User.create(values);
    } else if (!_.isEqual(_.pick(user, Object.keys(values)), values)) {
      user = await User.updateOne(_.pick(user, ['id'])).set(values);
    }

    const accessToken = sails.helpers.utils.createToken(user.id);

    await Session.create({
      accessToken,
      remoteAddress: getRemoteAddress(this.req),
      userId: user.id,
      userAgent: this.req.headers['user-agent'],
      ssoId: response.user.session_index,
    });

    this.res.cookie('accessToken', accessToken, {
      secure: true,
      sameSite: 'strict',
      maxAge: sails.config.custom.tokenExpiresIn * 86400000,
    });
    this.res.cookie('accessTokenVersion', 1, {
      secure: true,
      sameSite: 'strict',
      maxAge: sails.config.custom.tokenExpiresIn * 86400000,
    });

    return this.res.redirect(
      sails.config.custom.baseUrl || (env.NODE_ENV === 'prod' ? '/' : 'http://localhost:3000/'),
    );
  },
};
