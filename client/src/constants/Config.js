const SERVER_BASE_URL =
  process.env.REACT_APP_SERVER_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:1337');

const POSITION_GAP = 65535;

const ACTIONS_LIMIT = 10;

export default {
  SERVER_BASE_URL,
  POSITION_GAP,
  ACTIONS_LIMIT,
};
