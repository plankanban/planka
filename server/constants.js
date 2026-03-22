const AccessTokenSteps = {
  ACCEPT_TERMS: 'accept-terms',
};

const POSITION_GAP = 65536;

const MAX_SIZE_TO_GET_ENCODING = 8 * 1024 * 1024;

const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/avif',
  'image/heif',
  'image/heic',
];

module.exports = {
  AccessTokenSteps,
  POSITION_GAP,
  MAX_SIZE_TO_GET_ENCODING,
  SUPPORTED_IMAGE_MIME_TYPES,
};
