module.exports = {
  inputs: {
    code: {
      type: 'string',
      required: true,
    },
    nonce: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidCodeOrNonce: {},
    invalidUserinfoSignature: {},
    missingValues: {},
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
  },

  async fn(inputs) {
    const client = sails.hooks.oidc.getClient();

    let userInfo;
    try {
      const tokenSet = await client.callback(
        sails.config.custom.oidcRedirectUri,
        {
          iss: sails.config.custom.oidcIssuer,
          code: inputs.code,
        },
        {
          nonce: inputs.nonce,
        },
      );
      userInfo = await client.userinfo(tokenSet);
    } catch (e) {
      if (
        e instanceof SyntaxError &&
        e.message.includes('Unexpected token e in JSON at position 0')
      ) {
        sails.log.warn('Error while exchanging OIDC code: userinfo response is signed');
        throw 'invalidUserinfoSignature';
      }

      sails.log.warn(`Error while exchanging OIDC code: ${e}`);
      throw 'invalidCodeOrNonce';
    }

    if (
      !userInfo[sails.config.custom.oidcEmailAttribute] ||
      !userInfo[sails.config.custom.oidcNameAttribute]
    ) {
      throw 'missingValues';
    }

    let isAdmin = false;
    if (sails.config.custom.oidcAdminRoles.includes('*')) {
      isAdmin = true;
    } else {
      const roles = userInfo[sails.config.custom.oidcRolesAttribute];
      if (Array.isArray(roles)) {
        // Use a Set here to avoid quadratic time complexity
        const userRoles = new Set(userInfo[sails.config.custom.oidcRolesAttribute]);
        isAdmin = sails.config.custom.oidcAdminRoles.findIndex((role) => userRoles.has(role)) > -1;
      }
    }

    const values = {
      isAdmin,
      email: userInfo[sails.config.custom.oidcEmailAttribute],
      isSso: true,
      name: userInfo[sails.config.custom.oidcNameAttribute],
      subscribeToOwnCards: false,
    };
    if (!sails.config.custom.oidcIgnoreUsername) {
      values.username = userInfo[sails.config.custom.oidcUsernameAttribute];
    }

    let user;
    // This whole block technically needs to be executed in a transaction
    // with SERIALIZABLE isolation level (but Waterline does not support
    // that), so this will result in errors if for example users are deleted
    // concurrently with logging in via OIDC.
    let identityProviderUser = await IdentityProviderUser.findOne({
      issuer: sails.config.custom.oidcIssuer,
      sub: userInfo.sub,
    });

    if (identityProviderUser) {
      user = await sails.helpers.users.getOne(identityProviderUser.userId);
    } else {
      // If no IDP/User mapping exists, search for the user by email.
      user = await sails.helpers.users.getOne({
        email: values.email.toLowerCase(),
      });

      // Otherwise, create a new user.
      if (!user) {
        user = await sails.helpers.users.createOne
          .with({
            values,
            actorUser: User.OIDC,
          })
          .intercept('usernameAlreadyInUse', 'usernameAlreadyInUse');
      }

      identityProviderUser = await IdentityProviderUser.create({
        userId: user.id,
        issuer: sails.config.custom.oidcIssuer,
        sub: userInfo.sub,
      });
    }

    const updateFieldKeys = ['email', 'isSso', 'name'];
    if (!sails.config.custom.oidcIgnoreUsername) {
      updateFieldKeys.push('username');
    }
    if (!sails.config.custom.oidcIgnoreRoles) {
      updateFieldKeys.push('isAdmin');
    }

    const updateValues = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const k of updateFieldKeys) {
      if (values[k] !== user[k]) updateValues[k] = values[k];
    }

    if (Object.keys(updateValues).length > 0) {
      user = await sails.helpers.users.updateOne
        .with({
          record: user,
          values: updateValues,
          actorUser: User.OIDC,
        })
        .intercept('emailAlreadyInUse', 'emailAlreadyInUse')
        .intercept('usernameAlreadyInUse', 'usernameAlreadyInUse');
    }

    return user;
  },
};
