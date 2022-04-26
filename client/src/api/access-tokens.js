import http from './http';

/* Actions */

const createAccessToken = (data) => http.post('/access-tokens', data);

export default {
  createAccessToken,
};
