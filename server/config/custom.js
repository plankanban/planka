/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

/* eslint-disable no-console */

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

// Operators write these lists the way they read them — `http://a, http://b` —
// and the space after the comma belongs to the comma, not to the value. The
// URL parser forgives it, so the origins built below survive; everything that
// compares these strings as strings does not. A schema reads as ` discord`
// and matches nothing, and a `baseUrl` with a space in it goes out in every
// link PLANKA sends. An entry that was only separators is not an entry at all
// and becomes `new URL('')` somewhere downstream.
const envToArray = (value) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item)
    : [];

const RULE = '─'.repeat(72);

// Links, CORS origins and socket origins are all built from BASE_URL, so an
// unusable one is fatal however we handle it. The only thing left to decide is
// whether the operator is told which variable to look at, or handed
// `TypeError: Invalid URL` from a file they have never opened.
const exitWithUnusableBaseUrl = (problem, detail) => {
  console.error(RULE);
  console.error(`BASE_URL ${problem}`);
  console.error('');
  detail.forEach((line) => console.error(`  ${line}`));
  console.error('');
  console.error('  It is the address browsers use to reach this instance, scheme included:');
  console.error('');
  console.error('    BASE_URL=https://planka.example.com');
  console.error(RULE);

  return process.exit(1);
};

const baseUrls = envToArray(process.env.BASE_URL);

if (baseUrls.length === 0) {
  exitWithUnusableBaseUrl('is not set.', ['PLANKA cannot start without it.']);
}

// Every entry, not only the first: config/env/production.js turns all of them
// into origins, and the second one failing there produces the same bare
// TypeError with even less to go on.
const parsedBaseUrls = baseUrls.map((value) => {
  try {
    return new URL(value);
  } catch (error) {
    return exitWithUnusableBaseUrl(`contains "${value}", which is not a URL.`, [
      'A missing scheme is the usual reason: "planka.example.com" is not a URL,',
      '"https://planka.example.com" is.',
    ]);
  }
});

const baseUrl = baseUrls[0];
const parsedBasedUrl = parsedBaseUrls[0];

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

  appriseEnabled: process.env.APPRISE_ENABLED !== 'false',
  appriseAllowedSchemas: envToArray(process.env.APPRISE_ALLOWED_SCHEMAS),
  appriseBlockedSchemas: envToArray(process.env.APPRISE_BLOCKED_SCHEMAS),

  gravatarBaseUrl: process.env.GRAVATAR_BASE_URL,

  /* Internal */

  internalAccessToken: process.env.INTERNAL_ACCESS_TOKEN,
  termsType: process.env.TERMS_TYPE || 'custom',
  customerPanelUrl: process.env.CUSTOMER_PANEL_URL,
  demoMode: process.env.DEMO_MODE === 'true',
};
