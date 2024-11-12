/**
 * Production environment settings
 * (sails.config.*)
 *
 * What you see below is a quick outline of the built-in settings you need
 * to configure your Sails app for production.  The configuration in this file
 * is only used in your production environment, i.e. when you lift your app using:
 *
 * ```
 * NODE_ENV=production node app
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

const { URL } = require('url');

const { customLogger } = require('../../utils/logger');

const parsedBasedUrl = new URL(process.env.BASE_URL);

module.exports = {
  /**
   *
   * Tell Sails what database(s) it should use in production.
   *
   * (https://sailsjs.com/config/datastores)
   *
   */

  datastores: {
    /**
     *
     * Configure your default production database.
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

    default: {
      // adapter: 'sails-mysql',
      // url: 'mysql://user:password@host:port/database',
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
      // ssl: true,
    },
  },

  models: {
    /**
     *
     * To help avoid accidents, Sails automatically sets the automigration
     * strategy to "safe" when your app lifts in production mode.
     * (This is just here as a reminder.)
     *
     * More info:
     * https://sailsjs.com/docs/concepts/models-and-orm/model-settings#?migrate
     *
     */
    // migrate: 'safe',
    /**
     *
     * If, in production, this app has access to physical-layer CASCADE
     * constraints (e.g. PostgreSQL or MySQL), then set those up in the
     * database and uncomment this to disable Waterline's `cascadeOnDestroy`
     * polyfill.  (Otherwise, if you are using a databse like Mongo, you might
     * choose to keep this enabled.)
     *
     */
    // cascadeOnDestroy: false,
  },

  /**
   * Always disable "shortcut" blueprint routes.
   *
   * > You'll also want to disable any other blueprint routes if you are not
   * > actually using them (e.g. "actions" and "rest") -- but you can do
   * > that in `config/blueprints.js`, since you'll want to disable them in
   * > all environments (not just in production.)
   *
   */

  blueprints: {
    // shortcuts: false,
  },

  /**
   *
   * Configure your security settings for production.
   *
   * IMPORTANT:
   * If web browsers will be communicating with your app, be sure that
   * you have CSRF protection enabled.  To do that, set `csrf: true` over
   * in the `config/security.js` file (not here), so that CSRF app can be
   * tested with CSRF protection turned on in development mode too.
   *
   */

  security: {
    /**
     *
     * If this app has CORS enabled (see `config/security.js`) with the
     * `allowCredentials` setting enabled, then you should uncomment the
     * `allowOrigins` whitelist below.  This sets which "origins" are allowed
     * to send cross-domain (CORS) requests to your Sails app.
     *
     * > Replace "https://example.com" with the URL of your production server.
     * > Be sure to use the right protocol!  ("http://" vs. "https://")
     *
     */

    cors: {
      allRoutes: false,
      allowOrigins: '*',
      allowRequestHeaders: 'content-type',
      allowCredentials: false,
    },
  },

  /**
   *
   * Configure how your app handles sessions in production.
   *
   * (https://sailsjs.com/config/session)
   *
   * > If you have disabled the "session" hook, then you can safely remove
   * > this section from your `config/env/production.js` file.
   *
   */

  session: {
    /**
     *
     * Production session store configuration.
     *
     * Uncomment the following lines to finish setting up a package called
     * "@sailshq/connect-redis" that will use Redis to handle session data.
     * This makes your app more scalable by allowing you to share sessions
     * across a cluster of multiple Sails/Node.js servers and/or processes.
     * (See http://bit.ly/redis-session-config for more info.)
     *
     * > While @sailshq/connect-redis is a popular choice for Sails apps, many
     * > other compatible packages (like "connect-mongo") are available on NPM.
     * > (For a full list, see https://sailsjs.com/plugins/sessions)
     *
     */

    // adapter: '@sailshq/connect-redis',
    // url: 'redis://user:password@localhost:6379/databasenumber',

    /**
     *
     * Production configuration for the session ID cookie.
     *
     * Tell browsers (or other user agents) to ensure that session ID cookies
     * are always transmitted via HTTPS, and that they expire 24 hours after
     * they are set.
     *
     * Note that with `secure: true` set, session cookies will _not_ be
     * transmitted over unsecured (HTTP) connections. Also, for apps behind
     * proxies (like Heroku), the `trustProxy` setting under `http` must be
     * configured in order for `secure: true` to work.
     *
     * > While you might want to increase or decrease the `maxAge` or provide
     * > other options, you should always set `secure: true` in production
     * > if the app is being served over HTTPS.
     *
     * Read more:
     * https://sailsjs.com/config/session#?the-session-id-cookie
     *
     */

    cookie: {
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  /**
   *
   * Set up Socket.io for your production environment.
   *
   * (https://sailsjs.com/config/sockets)
   *
   * > If you have disabled the "sockets" hook, then you can safely remove
   * > this section from your `config/env/production.js` file.
   *
   */

  sockets: {
    /**
     *
     * Uncomment the `onlyAllowOrigins` whitelist below to configure which
     * "origins" are allowed to open socket connections to your Sails app.
     *
     * > Replace "https://example.com" etc. with the URL(s) of your app.
     * > Be sure to use the right protocol!  ("http://" vs. "https://")
     *
     */

    onlyAllowOrigins: [parsedBasedUrl.origin],

    /**
     *
     * If you are deploying a cluster of multiple servers and/or processes,
     * then uncomment the following lines.  This tells Socket.io about a Redis
     * server it can use to help it deliver broadcasted socket messages.
     *
     * > Be sure a compatible version of @sailshq/socket.io-redis is installed!
     * > (See https://sailsjs.com/config/sockets for the latest version info)
     *
     * (https://sailsjs.com/docs/concepts/deployment/scaling)
     *
     */

    // adapter: '@sailshq/socket.io-redis',
    // url: 'redis://user:password@bigsquid.redistogo.com:9562/databasenumber',
  },

  /**
   *
   * Set the production log level.
   *
   * (https://sailsjs.com/config/log)
   *
   */

  log: {
    /**
     * Passthrough plain log message(s) to
     * custom Winston console and file logger.
     *
     * Note that Winston's log levels override Sails' log levels.
     * Refer: https://github.com/winstonjs/winston#logging
     */

    inspect: false,
    custom: customLogger,

    /**
     * Removes the Sail.js init success logs (ASCII ship art).
     */

    noShip: true,
  },

  http: {
    /**
     *
     * The number of milliseconds to cache static assets in production.
     * (the "max-age" to include in the "Cache-Control" response header)
     *
     */

    cache: 365.25 * 24 * 60 * 60 * 1000, // One year

    /**
     *
     * Proxy settings
     *
     * If your app will be deployed behind a proxy/load balancer - for example,
     * on a PaaS like Heroku - then uncomment the `trustProxy` setting below.
     * This tells Sails/Express how to interpret X-Forwarded headers.
     *
     * This setting is especially important if you are using secure cookies
     * (see the `cookies: secure` setting under `session` above) or if your app
     * relies on knowing the original IP address that a request came from.
     *
     * (https://sailsjs.com/config/http)
     *
     */

    trustProxy: !!process.env.TRUST_PROXY,
  },

  /**
   *
   * Lift the server on port 80.
   * (if deploying behind a proxy, or to a PaaS like Heroku or Deis, you
   * probably don't need to set a port here, because it is oftentimes
   * handled for you automatically.  If you are not sure if you need to set
   * this, just try deploying without setting it and see if it works.)
   *
   */

  // port: 80,

  /**
   *
   * Configure an SSL certificate
   *
   * For the safety of your users' data, you should use SSL in production.
   * ...But in many cases, you may not actually want to set it up _here_.
   *
   * Normally, this setting is only relevant when running a single-process
   * deployment, with no proxy/load balancer in the mix.  But if, on the
   * other hand, you are using a PaaS like Heroku, you'll want to set up
   * SSL in your load balancer settings (usually somewhere in your hosting
   * provider's dashboard-- not here.)
   *
   * > For more information about configuring SSL in Sails, see:
   * > https://sailsjs.com/config/*#?sailsconfigssl
   *
   */

  // ssl: undefined,

  /**
   *
   * Production overrides for any custom settings specific to your app.
   * (for example, production credentials for 3rd party APIs like Stripe)
   *
   * > See config/custom.js for more info on how to configure these options.
   *
   */

  custom: {
    // baseUrl: 'https://example.com',
    // internalEmailAddress: 'support@example.com',
  },
};
