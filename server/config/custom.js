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

  tokenExpiresIn: parseInt(process.env.TOKEN_EXPIRES_IN, 10) || 365,

  userAvatarsPath: path.join(sails.config.paths.public, 'user-avatars'),
  userAvatarsUrl: `${process.env.BASE_URL}/user-avatars`,

  projectBackgroundImagesPath: path.join(sails.config.paths.public, 'project-background-images'),
  projectBackgroundImagesUrl: `${process.env.BASE_URL}/project-background-images`,

  attachmentsPath: path.join(sails.config.appPath, 'private', 'attachments'),
  attachmentsUrl: `${process.env.BASE_URL}/attachments`,

  oidcIssuer: process.env.OIDC_ISSUER,
  oidcAudience: process.env.OIDC_AUDIENCE,
  oidcClientId: process.env.OIDC_CLIENT_ID,
  oidcRolesAttribute: process.env.OIDC_ROLES_ATTRIBUTE || 'groups',
  oidcAdminRoles: process.env.OIDC_ADMIN_ROLES.split(',') || [],
  oidcredirectUri: process.env.OIDC_REDIRECT_URI,
  oidcJwksUri: process.env.OIDC_JWKS_URI,
  oidcScopes: process.env.OIDC_SCOPES || 'openid',
};
