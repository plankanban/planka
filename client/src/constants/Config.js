const SERVER_BASE_URL =
  process.env.REACT_APP_SERVER_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:1337');

const ACCESS_TOKEN_KEY = 'accessToken';
const ACCESS_TOKEN_VERSION_KEY = 'accessTokenVersion';
const ACCESS_TOKEN_VERSION = '1';

const POSITION_GAP = 65535;
const ACTIVITIES_LIMIT = 50;

export default {
  SERVER_BASE_URL,
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_VERSION_KEY,
  ACCESS_TOKEN_VERSION,
  POSITION_GAP,
  ACTIVITIES_LIMIT,
};
