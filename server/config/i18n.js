/**
 * Internationalization / Localization Settings
 * (sails.config.i18n)
 *
 * If your app will touch people from all over the world, i18n (or internationalization)
 * may be an important part of your international strategy.
 *
 * For a complete list of options for Sails' built-in i18n support, see:
 * https://sailsjs.com/config/i-18-n
 *
 * For more info on i18n in Sails in general, check out:
 * https://sailsjs.com/docs/concepts/internationalization
 */

module.exports.i18n = {
  /**
   *
   * Which locales are supported?
   *
   */

  locales: ['en', 'es', 'fr', 'de'],

  /**
   *
   * What is the default locale for the site? Note that this setting will be
   * overridden for any request that sends an "Accept-Language" header (i.e.
   * most browsers), but it's still useful if you need to localize the
   * response for requests made by non-browser clients (e.g. cURL).
   *
   */

  // defaultLocale: 'en',

  /**
   *
   * Path (relative to app root) of directory to store locale (translation)
   * files in.
   *
   */

  // localesDirectory: 'config/locales',
};
