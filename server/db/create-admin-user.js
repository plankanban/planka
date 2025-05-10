/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const { read } = require('read');
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

    process.env.DEFAULT_ADMIN_EMAIL = await input('Email', {
      isRequired: true,
    });

    process.env.DEFAULT_ADMIN_PASSWORD = await input('Password', {
      isRequired: true,
      isPassword: true,
    });

    process.env.DEFAULT_ADMIN_NAME = await input('Name', {
      isRequired: true,
    });

    process.env.DEFAULT_ADMIN_USERNAME = await input('Username');

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
