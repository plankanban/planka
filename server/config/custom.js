/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

const { URL } = require('url');
const bytes = require('bytes');
const sails = require('sails');

const version = require('../version');

const envToNumber = (value) => {
  if (!value) {
    return null;
  }

  const number = parseInt(value, 10);
  return Number.isNaN(number) ? null : number;
};

const envToBytes = (value) => bytes(value);

const envToArray = (value) => (value ? value.split(',') : []);

const baseUrl = envToArray(process.env.BASE_URL)[0];
const parsedBasedUrl = new URL(baseUrl);

module.exports.custom = {
  /**
   *
   * Any other custom config this Sails app should use during development.
   *
   */

  version,

  baseUrl,
  baseUrlPath: parsedBasedUrl.pathname,
  baseUrlSecure: parsedBasedUrl.protocol === 'https:',

  maxUploadFileSize: envToBytes(process.env.MAX_UPLOAD_FILE_SIZE),
  tokenExpiresIn: (parseInt(process.env.TOKEN_EXPIRES_IN, 10) || 365) * 24 * 60 * 60,

  // Location to receive uploaded files in. Default (non-string value) is a Sails-specific location.
  uploadsTempPath: null,
  uploadsBasePath: sails.config.appPath,

  preloadedFaviconsPathSegment: 'public/preloaded-favicons',
  faviconsPathSegment: 'public/favicons',
  userAvatarsPathSegment: 'public/user-avatars',
  backgroundImagesPathSegment: 'public/background-images',
  attachmentsPathSegment: 'private/attachments',

  defaultAdminEmail:
    process.env.DEFAULT_ADMIN_EMAIL && process.env.DEFAULT_ADMIN_EMAIL.toLowerCase(),

  internalAccessToken: process.env.INTERNAL_ACCESS_TOKEN,
  storageLimit: envToBytes(process.env.STORAGE_LIMIT),
  activeUsersLimit: envToNumber(process.env.ACTIVE_USERS_LIMIT),

  showDetailedAuthErrors: process.env.SHOW_DETAILED_AUTH_ERRORS === 'true',

  s3Endpoint: process.env.S3_ENDPOINT,
  s3Region: process.env.S3_REGION,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  s3Bucket: process.env.S3_BUCKET,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',

  oidcIssuer: process.env.OIDC_ISSUER,
  oidcClientId: process.env.OIDC_CLIENT_ID,
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET,
  oidcUseOauthCallback: process.env.OIDC_USE_OAUTH_CALLBACK === 'true',
  oidcIdTokenSignedResponseAlg: process.env.OIDC_ID_TOKEN_SIGNED_RESPONSE_ALG,
  oidcUserinfoSignedResponseAlg: process.env.OIDC_USERINFO_SIGNED_RESPONSE_ALG,
  oidcScopes: process.env.OIDC_SCOPES || 'openid email profile',
  oidcResponseMode: process.env.OIDC_RESPONSE_MODE || 'fragment',
  oidcUseDefaultResponseMode: process.env.OIDC_USE_DEFAULT_RESPONSE_MODE === 'true',
  oidcAdminRoles: envToArray(process.env.OIDC_ADMIN_ROLES),
  oidcProjectOwnerRoles: envToArray(process.env.OIDC_PROJECT_OWNER_ROLES),
  oidcBoardUserRoles: envToArray(process.env.OIDC_BOARD_USER_ROLES),
  oidcClaimsSource: process.env.OIDC_CLAIMS_SOURCE || 'userinfo',
  oidcEmailAttribute: process.env.OIDC_EMAIL_ATTRIBUTE || 'email',
  oidcNameAttribute: process.env.OIDC_NAME_ATTRIBUTE || 'name',
  oidcUsernameAttribute: process.env.OIDC_USERNAME_ATTRIBUTE || 'preferred_username',
  oidcRolesAttribute: process.env.OIDC_ROLES_ATTRIBUTE || 'groups',
  oidcIgnoreUsername: process.env.OIDC_IGNORE_USERNAME === 'true',
  oidcIgnoreRoles: process.env.OIDC_IGNORE_ROLES === 'true',
  oidcEnforced: process.env.OIDC_ENFORCED === 'true',

  // TODO: move client base url to environment variable?
  oidcRedirectUri: `${
    sails.config.environment === 'production' ? baseUrl : 'http://localhost:3000'
  }/oidc-callback`,

  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 587,
  smtpName: process.env.SMTP_NAME,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpTlsRejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFrom: process.env.SMTP_FROM,

  gravatarBaseUrl: process.env.GRAVATAR_BASE_URL,
};
