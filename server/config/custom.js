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

  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL,

  oidcIssuer: process.env.OIDC_ISSUER,
  oidcClientId: process.env.OIDC_CLIENT_ID,
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET,
  oidcScopes: process.env.OIDC_SCOPES || 'openid email profile',
  oidcAdminRoles: process.env.OIDC_ADMIN_ROLES ? process.env.OIDC_ADMIN_ROLES.split(',') : [],
  oidcRolesAttribute: process.env.OIDC_ROLES_ATTRIBUTE || 'groups',
  oidcIgnoreRoles: process.env.OIDC_IGNORE_ROLES === 'true',

  // TODO: move client base url to environment variable?
  oidcRedirectUri: `${
    sails.config.environment === 'production' ? process.env.BASE_URL : 'http://localhost:3000'
  }/oidc-callback`,
  mailConnectorHost: process.env.MAIL_HOST,
  mailConnectorPort: process.env.MAIL_PORT || 25,
  mailConnectorEmail: 'Planka <planka-noreplay@test.com>',
  mailConnectorUser: process.env.MAIL_USER,
  mailConnectorPass: process.env.MAIL_PASSWORD,
};
