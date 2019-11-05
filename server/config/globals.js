/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on any of these options, check out:
 * https://sailsjs.com/config/globals
 */

module.exports.globals = {
  /**
   *
   * Whether to expose the locally-installed Lodash as a global variable
   * (`_`), making  it accessible throughout your app.
   *
   */

  _: require('lodash'), // eslint-disable-line global-require

  /**
   *
   * This app was generated without a dependency on the "async" NPM package.
   *
   * > Don't worry!  This is totally unrelated to JavaScript's "async/await".
   * > Your code can (and probably should) use `await` as much as possible.
   *
   */

  async: false,

  /**
   *
   * Whether to expose each of your app's models as global variables.
   * (See the link at the top of this file for more information.)
   *
   */

  models: true,

  /**
   *
   * Whether to expose the Sails app instance as a global variable (`sails`),
   * making it accessible throughout your app.
   *
   */

  sails: true,
};
