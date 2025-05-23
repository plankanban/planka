/**
 * Blueprint API Configuration
 * (sails.config.blueprints)
 *
 * For background on the blueprint API in Sails, check out:
 * https://sailsjs.com/docs/reference/blueprint-api
 *
 * For details and more available options, see:
 * https://sailsjs.com/config/blueprints
 */

module.exports.blueprints = {
  /**
   *
   * Automatically expose implicit routes for every action in your app?
   *
   */

  // actions: false,

  /**
   *
   * Automatically expose RESTful routes for your models?
   *
   */

  // rest: true,

  /**
   *
   * Automatically expose CRUD "shortcut" routes to GET requests?
   * (These are enabled by default in development only.)
   *
   */

  shortcuts: false,
};
