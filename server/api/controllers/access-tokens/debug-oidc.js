/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    code: {
      type: 'string',
      maxLength: 2048,
      required: true,
    },
    nonce: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    if (!sails.config.custom.oidcDebug) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const logs = ['🔐 Starting OIDC debug flow...', ''];
    const client = await sails.hooks.oidc.getClient();

    if (!client) {
      logs.push('❌ OIDC client is not initialized.');
      logs.push('💡 Hint: Check your OIDC issuer and client configuration.');

      return {
        item: null,
        included: {
          logs,
        },
      };
    }

    let tokenSet;
    try {
      logs.push('🔄 Exchanging authorization code...');

      if (sails.config.custom.oidcUseOauthCallback) {
        tokenSet = await client.oauthCallback(
          sails.config.custom.oidcRedirectUri,
          {
            iss: sails.config.custom.oidcIssuer,
            code: inputs.code,
          },
          { nonce: inputs.nonce },
        );
      } else {
        tokenSet = await client.callback(
          sails.config.custom.oidcRedirectUri,
          {
            iss: sails.config.custom.oidcIssuer,
            code: inputs.code,
          },
          { nonce: inputs.nonce },
        );
      }

      logs.push('✅ Authorization code exchanged successfully.', '');
    } catch (error) {
      logs.push('❌ Failed to exchange authorization code.');
      logs.push(`💬 Reason: ${error.message || error.toString()}`);
      logs.push('💡 Hint: Check redirect URI, client secret, and nonce handling.');

      return {
        item: null,
        included: {
          logs,
        },
      };
    }

    if (sails.config.custom.oidcClaimsSource === 'id_token') {
      logs.push('📥 Extracting claims from ID token...');

      try {
        claims = tokenSet.claims();
        logs.push('✅ Claims extracted successfully.', '');
      } catch (error) {
        logs.push('❌ Failed to extract user claims.');
        logs.push(`💬 Reason: ${error.message || error.toString()}`);

        return {
          item: null,
          included: {
            logs,
          },
        };
      }
    } else {
      logs.push('📥 Fetching claims from userinfo endpoint...');

      try {
        claims = await client.userinfo(tokenSet);
        logs.push('✅ Claims fetched successfully.', '');
      } catch (error) {
        logs.push('❌ Failed to fetch user claims.');

        if (error instanceof SyntaxError && error.message.includes('Unexpected token e in JSON')) {
          logs.push('💬 Reason: Userinfo response is signed or not JSON.');
          logs.push(
            '💡 Hint: Try configuring userinfo signed response algorithm or switch to ID token claims.',
          );
        } else {
          logs.push(`💬 Reason: ${error.message || error.toString()}`);
        }

        return {
          item: null,
          included: {
            logs,
          },
        };
      }
    }

    logs.push('📦 Raw claims received:', JSON.stringify(claims, null, 2), '');
    logs.push('🧩 Evaluating claim mappings...', '');

    const mappings = {
      email: {
        attribute: sails.config.custom.oidcEmailAttribute,
        value: _.get(claims, sails.config.custom.oidcEmailAttribute),
      },
      name: {
        attribute: sails.config.custom.oidcNameAttribute,
        value: _.get(claims, sails.config.custom.oidcNameAttribute),
      },
      username: sails.config.custom.oidcIgnoreUsername
        ? undefined
        : {
            attribute: sails.config.custom.oidcUsernameAttribute,
            value: _.get(claims, sails.config.custom.oidcUsernameAttribute),
          },
      roles: sails.config.custom.oidcIgnoreRoles
        ? undefined
        : {
            attribute: sails.config.custom.oidcRolesAttribute,
            value: _.get(claims, sails.config.custom.oidcRolesAttribute),
          },
    };

    logs.push('📋 Mapping result:', JSON.stringify(mappings, null, 2), '');

    if (!mappings.email.value) {
      logs.push('❌ Email not resolved.');
      logs.push('💡 Hint: Check email attribute mapping.', '');
    }

    if (!mappings.name.value) {
      logs.push('❌ Name not resolved.');
      logs.push('💡 Hint: Check name attribute mapping.', '');
    }

    if (!sails.config.custom.oidcIgnoreUsername) {
      if (!mappings.username.value) {
        logs.push('⚠️ Username not resolved.');
        logs.push('💡 Hint: Check username attribute mapping.', '');
      }
    }

    if (!sails.config.custom.oidcIgnoreRoles) {
      if (!Array.isArray(mappings.roles.value) || mappings.roles.value.length === 0) {
        logs.push('⚠️ Roles not resolved or empty.');
        logs.push('💡 Hint: Check roles attribute mapping or IdP role configuration.', '');
      } else {
        logs.push('🎭 Resolving user role from OIDC roles...');

        // Use a Set here to avoid quadratic time complexity
        const claimsRolesSet = new Set(mappings.roles.value);

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
          logs.push(`✅ Matched user role → ${_.lowerCase(foundRole)}`, '');
        } else {
          logs.push('⚠️ No user role matched configured OIDC roles.');
          logs.push('💡 Hint: Check role matching settings.', '');
        }
      }
    }

    if (mappings.email.value && mappings.name.value) {
      logs.push('🎉 OIDC debug completed successfully.');
    } else {
      logs.push('🛑 OIDC debug detected missing required attributes.');
    }

    return {
      item: null,
      included: {
        logs,
      },
    };
  },
};
