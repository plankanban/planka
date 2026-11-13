/**
 * Test environment settings
 * (sails.config.*)
 *
 * What you see below is a quick outline of the built-in settings you need
 * to configure your Sails app for test.  The configuration in this file
 * is only used in your test environment, i.e. when you lift your app using:
 *
 * ```
 * NODE_ENV=test node app
 * ```
 *
 * > If you're using git as a version control solution for your Sails app,
 * > this file WILL BE COMMITTED to your repository by default, unless you add
 * > it to your .gitignore file.  If your repository will be publicly viewable,
 * > don't add private/sensitive data (like API secrets / db passwords) to this file!
 *
 * For more best practices and tips, see:
 * https://sailsjs.com/docs/concepts/deployment
 */

module.exports = {
  /**
   *
   * Tell Sails what database(s) it should use in test.
   *
   * (https://sailsjs.com/config/datastores)
   *
   */

  datastores: {
    /**
     *
     * Configure your default test database.
     *
     * 1. Choose an adapter:
     *    https://sailsjs.com/plugins/databases
     *
     * 2. Install it as a dependency of your Sails app.
     *    (For example:  npm install sails-mysql --save)
     *
     * 3. Then set it here (`adapter`), along with a connection URL (`url`)
     *    and any other, adapter-specific customizations.
     *    (See https://sailsjs.com/config/datastores for help.)
     *
     */

    /**
     * `sails-disk` in-memory by default, so `npm test` needs no infrastructure.
     *
     * Integration tests that exercise the delete cascades need a real Postgres:
     * the query-method layer drops to `sails.sendNativeQuery` for the comment
     * and attachment counters, and the orphan census is a set of LEFT JOINs.
     * Those tests opt in via TEST_DATABASE_URL and skip themselves without it.
     *
     * TEST_DATABASE_URL is deliberately NOT DATABASE_URL: `test/lifecycle.test.js`
     * loads `.env`, and silently pointing a truncating test suite at a
     * developer's or an operator's DATABASE_URL is how you lose a database.
     * Point it at a throwaway container and nothing else.
     */

    default: process.env.TEST_DATABASE_URL
      ? {
          adapter: 'sails-postgresql',
          url: process.env.TEST_DATABASE_URL,
        }
      : {
          adapter: 'sails-disk',

          /**
           *
           * More adapter-specific options
           *
           * > For example, for some hosted PostgreSQL providers (like Heroku), the
           * > extra `ssl: true` option is mandatory and must be provided.
           *
           * More info:
           * https://sailsjs.com/config/datastores
           *
           */

          inMemoryOnly: true,
        },
  },

  log: {
    level: 'warn',
  },
};
