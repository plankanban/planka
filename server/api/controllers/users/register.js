/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true,
      maxLength: 256,
    },
    password: {
      type: 'string',
      required: true,
      maxLength: 256,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
      maxLength: 128,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 64,
    },
  },

  exits: {
    registrationDisabled: {
      responseType: 'forbidden',
    },
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const config = await Config.qm.getOneMain();

    if (!config.registrationEnabled) {
      throw {
        registrationDisabled: 'Registration is disabled',
      };
    }

    const values = {
      email: inputs.email.toLowerCase(),
      password: inputs.password,
      name: inputs.name,
      role: User.Roles.BOARD_USER,
    };

    if (inputs.username) {
      values.username = inputs.username;
    }

    // Check for duplicate email
    const existingUserByEmail = await User.qm.getOneByEmail(values.email);
    if (existingUserByEmail) {
      throw {
        emailAlreadyInUse: 'Email already in use',
      };
    }

    if (values.username) {
      const existingUserByUsername = await User.qm.getOneByUsername(values.username);
      if (existingUserByUsername) {
        throw {
          usernameAlreadyInUse: 'Username already in use',
        };
      }
    }

    const user = await sails.helpers.users.createOne.with({
      values,
      request: this.req,
    });

    return {
      item: _.pick(user, ['id', 'email', 'name', 'username']),
    };
  },
};
