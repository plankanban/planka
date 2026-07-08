/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const { read } = require('read');
const validator = require('validator');
const initKnex = require('knex');

const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

const input = async (fieldName, options = {}) => {
  const readOptions = {
    prompt: `${fieldName}${!options.isRequired ? ' (optional)' : ''}: `,
  };

  if (options.isPassword) {
    Object.assign(readOptions, {
      silent: true,
      replace: '*',
    });
  }

  let value;
  while (!value) {
    value = await read(readOptions);

    if (!options.isPassword) {
      value = value.trim();
    }

    if (options.isRequired && !value) {
      console.log(`${fieldName} cannot be blank!`);
    } else {
      break;
    }
  }

  return value;
};

(async () => {
  try {
    await knex.migrate.latest();

    let isEmailValid = false;
    while (!isEmailValid) {
      process.env.DEFAULT_ADMIN_EMAIL = await input('Email', {
        isRequired: true,
      });

      if (
        !validator.isEmail(process.env.DEFAULT_ADMIN_EMAIL) ||
        process.env.DEFAULT_ADMIN_EMAIL.length > 256
      ) {
        console.log('Email must be a valid e-mail address with no more than 256 characters.');
      } else {
        const existingUser = await knex('user_account')
          .where('email', process.env.DEFAULT_ADMIN_EMAIL.toLowerCase())
          .first();

        if (existingUser) {
          console.log('Email is already in use.');
        } else {
          isEmailValid = true;
        }
      }
    }

    process.env.DEFAULT_ADMIN_PASSWORD = await input('Password', {
      isRequired: true,
      isPassword: true,
    });

    process.env.DEFAULT_ADMIN_NAME = await input('Name', {
      isRequired: true,
    });

    while (process.env.DEFAULT_ADMIN_NAME.length > 128) {
      console.log('Name must be no more than 128 characters.');
      process.env.DEFAULT_ADMIN_NAME = await input('Name', {
        isRequired: true,
      });
    }

    const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;

    let isUsernameValid = false;
    while (!isUsernameValid) {
      process.env.DEFAULT_ADMIN_USERNAME = await input('Username');

      if (!process.env.DEFAULT_ADMIN_USERNAME) {
        break;
      }

      const isValid =
        process.env.DEFAULT_ADMIN_USERNAME.length >= 3 &&
        process.env.DEFAULT_ADMIN_USERNAME.length <= 32 &&
        USERNAME_REGEX.test(process.env.DEFAULT_ADMIN_USERNAME);

      if (!isValid) {
        console.log(
          'Username must be 3-32 characters and contain only letters, digits, underscores, and dots (e.g., john_doe).',
        );
      } else {
        const existingUser = await knex('user_account')
          .where('username', process.env.DEFAULT_ADMIN_USERNAME.toLowerCase())
          .first();

        if (existingUser) {
          console.log('Username is already in use.');
        } else {
          isUsernameValid = true;
        }
      }
    }

    await knex.seed.run({
      specific: 'default.js',
    });
  } catch (error) {
    process.exitCode = 1;
    throw error;
  } finally {
    knex.destroy();
  }
})();
