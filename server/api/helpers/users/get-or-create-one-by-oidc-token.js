const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const openidClient = require('openid-client');

const jwks = jwksClient({
  jwksUri: sails.config.custom.oidcJwksUri,
});

const verifyOidcToken = async (oidcToken) => {
  const signingKeys = await jwks.getSigningKeys();

  const options = {
    issuer: sails.config.custom.oidcIssuer,
  };

  if (sails.config.custom.oidcAudience) {
    options.audience = sails.config.custom.oidcAudience;
  }

  let payload = null;
  signingKeys.some((signingKey) => {
    try {
      const publicKey = signingKey.getPublicKey();
      payload = jwt.verify(oidcToken, publicKey, options);
    } catch (error) {
      sails.log.error(error);
    }

    return !!payload;
  });

  return payload;
};

const getUserInfo = async (oidcToken) => {
  const issuer = await openidClient.Issuer.discover(sails.config.custom.oidcIssuer);

  const client = new issuer.Client({
    client_id: 'irrelevant',
  });

  return client.userinfo(oidcToken);
};

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidToken: {},
    missingValues: {},
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
  },

  async fn(inputs) {
    const oidcUser = await verifyOidcToken(inputs.token);

    if (!oidcUser) {
      throw 'invalidToken';
    }

    if (!sails.config.custom.oidcSkipUserInfo) {
      const userInfo = await getUserInfo(inputs.token);
      Object.assign(oidcUser, userInfo);
    }

    if (!oidcUser.email || !oidcUser.name) {
      throw 'missingValues';
    }

    let isAdmin = false;
    if (sails.config.custom.oidcAdminRoles.includes('*')) {
      isAdmin = true;
    } else {
      const roles = oidcUser[sails.config.custom.oidcRolesAttribute];

      if (Array.isArray(roles)) {
        isAdmin = sails.config.custom.oidcAdminRoles.some((role) => roles.includes(role));
      }
    }

    const values = {
      isAdmin,
      email: oidcUser.email,
      isSso: true,
      name: oidcUser.name,
      username: oidcUser.preferred_username,
      subscribeToOwnCards: false,
    };

    let user;
    /* eslint-disable no-constant-condition, no-await-in-loop */
    while (true) {
      let identityProviderUser = await IdentityProviderUser.findOne({
        issuer: oidcUser.iss,
        sub: oidcUser.sub,
      });

      if (identityProviderUser) {
        user = await sails.helpers.users.getOne(identityProviderUser.userId);
      } else {
        while (true) {
          user = await sails.helpers.users.getOne({
            email: values.email,
          });

          if (!user) {
            user = await sails.helpers.users
              .createOne(values)
              .tolerate('emailAlreadyInUse')
              .intercept('usernameAlreadyInUse', 'usernameAlreadyInUse');
          }

          if (user) {
            break;
          }
        }

        identityProviderUser = await IdentityProviderUser.create({
          userId: user.id,
          issuer: oidcUser.iss,
          sub: oidcUser.sub,
        }).tolerate('E_UNIQUE');
      }

      if (identityProviderUser) {
        break;
      }
    }
    /* eslint-enable no-constant-condition, no-await-in-loop */

    const updateFieldKeys = ['email', 'isAdmin', 'isSso', 'name', 'username'];

    const updateValues = updateFieldKeys.reduce((result, fieldKey) => {
      if (values[fieldKey] === user[fieldKey]) {
        return result;
      }

      return {
        ...result,
        [fieldKey]: values[fieldKey],
      };
    }, {});

    if (Object.keys(updateValues).length > 0) {
      user = await sails.helpers.users
        .updateOne(user, updateValues, {}) // FIXME: hack for last parameter
        .intercept('emailAlreadyInUse', 'emailAlreadyInUse')
        .intercept('usernameAlreadyInUse', 'usernameAlreadyInUse');
    }

    return user;
  },
};
