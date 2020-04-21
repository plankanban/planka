/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

const path = require('path');
const sails = require('sails');

module.exports.custom = {
  /**
   *
   * Any other custom config this Sails app should use during development.
   *
   */

  baseUrl: process.env.BASE_URL,

  userAvatarsPath: path.join(sails.config.paths.public, 'user-avatars'),
  userAvatarsUrl: `${process.env.BASE_URL}/user-avatars`,

  attachmentsPath: path.join(sails.config.paths.public, 'attachments'),
  attachmentsUrl: `${process.env.BASE_URL}/attachments`,
};
