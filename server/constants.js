const AccessTokenSteps = {
  ACCEPT_TERMS: 'accept-terms',
  VERIFY_TOTP: 'verify-totp',
};

const POSITION_GAP = 65536;

const MAX_SIZE_TO_GET_ENCODING = 8 * 1024 * 1024;
const MAX_SIZE_TO_PROCESS_AS_IMAGE = 64 * 1024 * 1024;

const TRUST_DEVICE_COOKIE_NAME = 'planka-trust-token';
const TRUST_DEVICE_EXPIRES_IN_DAYS = 30;

module.exports = {
  AccessTokenSteps,
  POSITION_GAP,
  MAX_SIZE_TO_GET_ENCODING,
  MAX_SIZE_TO_PROCESS_AS_IMAGE,
  TRUST_DEVICE_COOKIE_NAME,
  TRUST_DEVICE_EXPIRES_IN_DAYS,
};
