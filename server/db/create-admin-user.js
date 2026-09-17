/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const { read } = require('read');
const validator = require('validator');
const zxcvbn = require('zxcvbn');
const initKnex = require('knex');

const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

const RULE = '─'.repeat(72);

// The one question in here that is not a value. Default is no, because the
// thing it guards is destructive and the answer to a prompt nobody read
// should be the harmless one.
const confirm = async (question) => {
  const value = await read({
    prompt: `${question} [y/N]: `,
  });

  return /^y(es)?$/i.test(value.trim());
};

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
    try {
      await knex.migrate.latest();
    } catch (error) {
      // A PLANKA v1 database still lists v1's migrations, none of which this
      // release carries any more, and knex describes that as a corrupt
      // directory — which sends people to look at the filesystem instead of at
      // the upgrade they have not run yet.
      if (!error.message || !error.message.includes('migration directory is corrupt')) {
        throw error;
      }

      console.error(RULE);
      console.error('This database was not created by this version of PLANKA.');
      console.error('');
      console.error('  It still lists migrations this release no longer carries, which is what a');
      console.error('  PLANKA v1 database looks like to PLANKA v2. Nothing has been changed.');
      console.error('');
      console.error('  Upgrade it first, then run this script again:');
      console.error('');
      console.error('    npm run db:upgrade');
      console.error('');
      console.error(`  knex reported: ${error.message}`);
      console.error(RULE);

      process.exitCode = 1;
      return;
    }

    // Set once the operator has confirmed that an account already on this
    // instance is the one they mean. From there on the seed updates instead of
    // inserting, and the closing line has to say so.
    let isExistingUser = false;

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
          // Refusing outright was the previous answer, and it shut the only
          // door back into an instance whose admin password was lost — PLANKA
          // has no self-service reset in either edition. Letting it through
          // unremarked is how somebody ends up with a duplicate they never
          // meant to make. So state which account it is and ask: the accident
          // is one keystroke from being caught, and the recovery one keystroke
          // from being possible.
          console.log(`${process.env.DEFAULT_ADMIN_EMAIL} already belongs to an account:`);
          console.log(`  Name:     ${existingUser.name}`);
          console.log(`  Username: ${existingUser.username || '(none)'}`);
          console.log(`  Role:     ${existingUser.role}`);
          console.log('');
          console.log('Continuing replaces its password, name and username with what you enter');
          console.log('below, makes it an admin, and reactivates it if it was deactivated.');
          console.log('No second account is created.');

          isEmailValid = await confirm('Update this account?');
          isExistingUser = isEmailValid;

          if (!isEmailValid) {
            console.log('Left untouched. Enter a different address, or press Ctrl+C to stop.');
          }
        } else {
          isEmailValid = true;
        }
      }
    }

    let isPasswordValid = false;
    while (!isPasswordValid) {
      process.env.DEFAULT_ADMIN_PASSWORD = await input('Password', {
        isRequired: true,
        isPassword: true,
      });

      if (zxcvbn(process.env.DEFAULT_ADMIN_PASSWORD).score >= 2) {
        isPasswordValid = true;
      } else {
        console.log('Password is too weak. Choose a stronger password.');
      }
    }

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
        // Excluding this address keeps the check honest in both directions: no
        // row carries it when the account is new, and when it is not, the
        // account is allowed to keep the username it already has.
        const existingUsernameUser = await knex('user_account')
          .where('username', process.env.DEFAULT_ADMIN_USERNAME.toLowerCase())
          .whereNot('email', process.env.DEFAULT_ADMIN_EMAIL.toLowerCase())
          .first();

        if (existingUsernameUser) {
          console.log('Username is already in use.');
        } else {
          isUsernameValid = true;
        }
      }
    }

    await knex.seed.run({
      specific: 'default.js',
    });

    if (isExistingUser) {
      console.log(
        `Updated ${process.env.DEFAULT_ADMIN_EMAIL}. Its password is the one you entered.`,
      );
    } else {
      console.log(`Created ${process.env.DEFAULT_ADMIN_EMAIL} as an admin.`);
    }
  } catch (error) {
    process.exitCode = 1;
    throw error;
  } finally {
    knex.destroy();
  }
})();
