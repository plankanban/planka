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
  baseUrlPath: parsedBasedUrl.pathname.replace(/\/$/, ''), // Remove trailing slash
  baseUrlSecure: parsedBasedUrl.protocol === 'https:',

  maxUploadFileSize: envToBytes(process.env.MAX_UPLOAD_FILE_SIZE),
  tokenExpiresIn: (parseInt(process.env.TOKEN_EXPIRES_IN, 10) || 365) * 24 * 60 * 60,

  // A second factor needs a harder stop than a time window: six digits fall to
  // patience alone. After this many wrong codes the pending session is
  // destroyed and the login starts over from the password, so the ten minutes
  // a pending token is valid for stop being ten minutes of free guessing.
  totpMaxAttempts: parseInt(process.env.TOTP_MAX_ATTEMPTS, 10) || 5,

  // Ceiling on sign-in attempts, counted per client address and per account.
  // The two attacks look different: one source working through many accounts is
  // caught by the first, many sources working on one account by the second.
  //
  // Counted in the process that serves the request, not in shared storage —
  // PLANKA needs no Redis, and the stock deployment is a single container. Run
  // several and each keeps its own count, so the effective ceiling multiplies
  // by the number of processes. Put a limiter in your proxy if that matters.
  authRateLimitWindow: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW, 10) || 60,
  authRateLimitMaxPerIp: parseInt(process.env.AUTH_RATE_LIMIT_MAX_PER_IP, 10) || 30,
  authRateLimitMaxPerIdentifier: parseInt(process.env.AUTH_RATE_LIMIT_MAX_PER_IDENTIFIER, 10) || 10,

  storageLimit: envToBytes(process.env.STORAGE_LIMIT),
  activeUsersLimit: envToNumber(process.env.ACTIVE_USERS_LIMIT),

  // In seconds
  dueDateExpirationCheckInterval: envToNumber(process.env.DUE_DATE_EXPIRATION_CHECK_INTERVAL) || 60,

  // Location to receive uploaded files in. Default (non-string value) is a Sails-specific location.
  uploadsTempPath: null,
  uploadsBasePath: path.join(sails.config.appPath, 'data'),

  faviconsPathSegment: 'protected/favicons',
  userAvatarsPathSegment: 'protected/user-avatars',
  backgroundImagesPathSegment: 'protected/background-images',
  attachmentsPathSegment: 'private/attachments',

  defaultAdminEmail:
    process.env.DEFAULT_ADMIN_EMAIL && process.env.DEFAULT_ADMIN_EMAIL.toLowerCase(),

  showDetailedAuthErrors: process.env.SHOW_DETAILED_AUTH_ERRORS === 'true',
  outgoingProxy: process.env.OUTGOING_PROXY,
  swaggerExposed: process.env.SWAGGER_EXPOSED === 'true',

  s3Endpoint: process.env.S3_ENDPOINT,
  s3Region: process.env.S3_REGION,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  s3Bucket: process.env.S3_BUCKET,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  s3RequestChecksumCalculation: process.env.S3_REQUEST_CHECKSUM_CALCULATION,

  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 587,
  smtpName: process.env.SMTP_NAME,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpTlsRejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFrom: process.env.SMTP_FROM,

  gravatarBaseUrl: process.env.GRAVATAR_BASE_URL,

  /* Internal */

  internalAccessToken: process.env.INTERNAL_ACCESS_TOKEN,
  termsType: process.env.TERMS_TYPE || 'custom',
  customerPanelUrl: process.env.CUSTOMER_PANEL_URL,
  demoMode: process.env.DEMO_MODE === 'true',
};
