/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful,
 * such as when you deploy to a server, or a PaaS like Heroku.
 *
 * For example:
 *   => `node app.js`
 *   => `npm start`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *
 * The same command-line arguments and env vars are supported, e.g.:
 * `NODE_ENV=production node app.js --port=80 --verbose`
 *
 * For more information see:
 *   https://sailsjs.com/anatomy/app.js
 */

const dotenv = require('dotenv');

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
// > Note: This is not required in order to lift, but it is a convenient default.
process.chdir(__dirname);

dotenv.config();

// Attempt to import `sails` dependency, as well as `rc` (for loading `.sailsrc` files).
let sails;
let rc;

try {
  /* eslint-disable global-require */
  sails = require('sails');
  rc = require('sails/accessible/rc');
  /* eslint-enable global-require */
} catch (error) {
  /* eslint-disable no-console */
  console.error("Encountered an error when attempting to require('sails'):");
  console.error(error.stack);
  console.error('--');
  console.error('To run an app using `node app.js`, you need to have Sails installed');
  console.error("locally (`./node_modules/sails`).  To do that, just make sure you're");
  console.error('in the same directory as your app and run `npm install`.');
  console.error();
  console.error('If Sails is installed globally (i.e. `npm install -g sails`) you can');
  console.error('also run this app with `sails lift`.  Running with `sails lift` will');
  console.error('not run this file (`app.js`), but it will do exactly the same thing.');
  console.error("(It even uses your app directory's local Sails install, if possible.)");
  /* eslint-enable no-console */

  process.exit(1);
}

// Start server
sails.lift(rc('sails'));
