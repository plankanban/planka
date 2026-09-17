/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

const serveStatic = require('serve-static');
const sails = require('sails');

// Vite writes a content hash into the filename of everything it emits under
// /assets/, so a later build never reuses one of those URLs. Nothing else in
// public/ is named that way.
const HASHED_ASSETS_URL_PREFIX = '/assets/';

// Keep the copy, but confirm it before every reuse. `no-store` would be the
// blunt version and would cost a full download on every visit; this way the
// usual answer is a 304 and the bytes stay put. It is spelled out rather than
// written as `no-cache` because nearly every install has a reverse proxy in
// front of PLANKA: `must-revalidate` is what stops that proxy from handing out
// its stale copy while PLANKA is restarting, which is the one moment the copy
// is certain to be wrong.
const REVALIDATED_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

// serve-static calls this just before it writes the headers, and it leaves a
// Cache-Control that is already set alone.
const setRevalidatedCacheControl = (res) => {
  res.setHeader('Cache-Control', REVALIDATED_CACHE_CONTROL);
};

module.exports.http = {
  /**
   *
   * Sails/Express middleware to run for every HTTP request.
   * (Only applies to HTTP requests -- not virtual WebSocket requests.)
   *
   * https://sailsjs.com/documentation/concepts/middleware
   *
   */

  middleware: {
    /**
     *
     * The order in which middleware should be run for HTTP requests.
     * (This Sails app's routes are handled by the "router" middleware below.)
     *
     */
    // order: [
    //   'cookieParser',
    //   'session',
    //   'bodyParser',
    //   'compress',
    //   'poweredBy',
    //   'router',
    //   'www',
    //   'favicon',
    // ],
    /**
     *
     * The body parser that will handle incoming multipart HTTP requests.
     *
     * https://sailsjs.com/config/http#?customizing-the-body-parser
     *
     */
    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

    poweredBy: false,

    www(req, res, next) {
      // Only the hashed assets may be kept for a year, because only they get a
      // new URL when they change. The rest of public/ — the favicons, the web
      // manifest, robots.txt, and index.html wherever it is served as a file —
      // keeps the same URL across an upgrade, so a year-long copy is simply
      // last release's file. index.html is the one that does damage: it names
      // the hashed bundles, and a stale copy asks for bundles the new build no
      // longer ships, which is the blank page with nothing in the log that gets
      // reported after every upgrade.
      const isHashedAsset = req.url.startsWith(HASHED_ASSETS_URL_PREFIX);

      const middleware = serveStatic(sails.config.paths.public, {
        maxAge: isHashedAsset ? sails.config.http.cache : 0,
        immutable: isHashedAsset,
        setHeaders: isHashedAsset ? undefined : setRevalidatedCacheControl,
      });

      return middleware(req, res, next);
    },
  },
};
