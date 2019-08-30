import http from './http';

/* Actions */

const createAccessToken = (data, headers) => http.post('/access-tokens', data, headers);

export default {
  createAccessToken,
};
