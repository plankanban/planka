module.exports = {
  inputs: {
    code: {
      type: 'string',
      required: true,
    }
  },

  exits: {
    invalidEmailOrUsername: {
      responseType: 'unauthorized',
    },
    invalidPassword: {
      responseType: 'unauthorized',
    },
  },

  async fn(inputs) {
    const client = sails.hooks.oidc.getClient();

    const tokenSet = await client.callback(sails.config.custom.baseUrl + "/login", { code: inputs.code });
    const userInfo = await client.userinfo(tokenSet);

    const now = new Date();
    let isAdmin = false;
    if (sails.config.custom.oidcAdminRoles.includes('*'))
      isAdmin = true;
    else {
      if (Array.isArray(userInfo[sails.config.custom.oidcRolesAttribute])) {
        const userRoles = new Set(userInfo[sails.config.custom.oidcRolesAttribute]);
        isAdmin = sails.config.custom.oidcAdminRoles.findIndex(role => userRoles.has(role)) > -1;
      }
    }

    const newUser = {
      email: userInfo.email,
      password: "$sso$", // Prohibit password login for SSO accounts
      isAdmin,
      name: userInfo.name,
      username: userInfo.sub,
      subscribeToOwnCards: false,
      createdAt: now,
      updatedAt: now,
    };

    const user = await User.findOrCreate({ username: userInfo.sub }, newUser);

    const controlledFields = ["email", "password", "isAdmin", "name", "username"];
    const updateFields = {};
    for (const field of controlledFields) {
      if (user[field] !== newUser[field]) {
        updateFields[field] = newUser[field];
      }
    }
    if (Object.keys(updateFields).length > 0) {
      updateFields.updatedAt = now;
      await User.updateOne({ id: user.id }).set(updateFields);
    }

    return {
      item: sails.helpers.utils.signToken(user.id),
    };
  },
};
