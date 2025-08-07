/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
    invalidOidcConfiguration: {},
    invalidCodeOrNonce: {},
    invalidUserinfoConfiguration: {},
    missingValues: {},
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
    activeLimitReached: {},
  },

  async fn(inputs) {
    const client = await sails.hooks.oidc.getClient();

    if (!client) {
      throw 'invalidOidcConfiguration';
    }

    let tokenSet;
    try {
      if (sails.config.custom.oidcUseOauthCallback) {
        tokenSet = await client.oauthCallback(
          sails.config.custom.oidcRedirectUri,
          {
            iss: sails.config.custom.oidcIssuer,
            code: inputs.code,
          },
          {
            nonce: inputs.nonce,
          },
        );
      } else {
        tokenSet = await client.callback(
          sails.config.custom.oidcRedirectUri,
          {
            iss: sails.config.custom.oidcIssuer,
            code: inputs.code,
          },
          {
            nonce: inputs.nonce,
          },
        );
      }
    } catch (error) {
      sails.log.warn(`Error while exchanging OIDC code: ${error}`);
      throw 'invalidCodeOrNonce';
    }

    let claims;
    if (sails.config.custom.oidcClaimsSource === 'id_token') {
      claims = tokenSet.claims();
    } else {
      try {
        claims = await client.userinfo(tokenSet);
      } catch (error) {
        let errorText;
        if (
          error instanceof SyntaxError &&
          error.message.includes('Unexpected token e in JSON at position 0')
        ) {
          errorText = 'response is signed';
        } else {
          errorText = error.toString();
        }

        sails.log.warn(`Error while fetching OIDC userinfo: ${errorText}`);
        throw 'invalidUserinfoConfiguration';
      }
    }

    const email = claims[sails.config.custom.oidcEmailAttribute];
    const name = claims[sails.config.custom.oidcNameAttribute];

    if (!email || !name) {
      throw 'missingValues';
    }

    let role = User.Roles.BOARD_USER;
    if (!sails.config.custom.oidcIgnoreRoles) {
      const claimsRoles = claims[sails.config.custom.oidcRolesAttribute];

      if (Array.isArray(claimsRoles)) {
        // Use a Set here to avoid quadratic time complexity
        const claimsRolesSet = new Set(claimsRoles);

        const foundRole = [User.Roles.ADMIN, User.Roles.PROJECT_OWNER, User.Roles.BOARD_USER].find(
          (roleItem) => {
            const configRoles = sails.config.custom[`oidc${_.upperFirst(roleItem)}Roles`];

            if (configRoles.includes('*')) {
              return true;
            }
            return configRoles.some((configRole) => claimsRolesSet.has(configRole));
          },
        );

        if (foundRole) {
          role = foundRole;
        }
      }
    }

    const values = {
      email,
      role,
      name,
      isSsoUser: true,
    };
    if (!sails.config.custom.oidcIgnoreUsername) {
      values.username = claims[sails.config.custom.oidcUsernameAttribute];
    }

    // This whole block technically needs to be executed in a transaction
    // with SERIALIZABLE isolation level (but Waterline does not support
    // that), so this will result in errors if for example users are deleted
    // concurrently with logging in via OIDC.
    let identityProviderUser = await IdentityProviderUser.qm.getOneByIssuerAndSub(
      sails.config.custom.oidcIssuer,
      claims.sub,
    );

    let user;
    let isCreated = false;

    if (identityProviderUser) {
      user = await User.qm.getOneById(identityProviderUser.userId);
    } else {
      // If no IDP/User mapping exists, search for the user by email.
      user = await User.qm.getOneByEmail(values.email);

      // Otherwise, create a new user.
      if (!user) {
        user = await sails.helpers.users.createOne
          .with({
            values,
            actorUser: User.OIDC,
          })
          .intercept('usernameAlreadyInUse', 'usernameAlreadyInUse')
          .intercept('activeLimitReached', 'activeLimitReached');

        isCreated = true;
      }

      identityProviderUser = await IdentityProviderUser.qm.createOne({
        userId: user.id,
        issuer: sails.config.custom.oidcIssuer,
        sub: claims.sub || `${user.id}@${sails.config.custom.oidcIssuer}`,
      });
    }

    if (!isCreated) {
      values.isDeactivated = false;

      const updateFieldKeys = ['email', 'name', 'isSsoUser', 'isDeactivated'];
      if (!sails.config.custom.oidcIgnoreUsername) {
        updateFieldKeys.push('username');
      }
      if (!sails.config.custom.oidcIgnoreRoles) {
        updateFieldKeys.push('role');
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
          .intercept('usernameAlreadyInUse', 'usernameAlreadyInUse')
          .intercept('activeLimitReached', 'activeLimitReached');
      }
    }

    return user;
  },
};
