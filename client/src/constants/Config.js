const SERVER_BASE_URL =
  process.env.REACT_APP_SERVER_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:1337');

const FETCH_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? undefined
    : {
        credentials: 'include',
      };

const ACCESS_TOKEN_KEY = 'accessToken';
const ACCESS_TOKEN_EXPIRES = 365;

const POSITION_GAP = 65535;
const ACTIONS_LIMIT = 10;

export default {
  SERVER_BASE_URL,
  FETCH_OPTIONS,
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRES,
  POSITION_GAP,
  ACTIONS_LIMIT,
};
