import http from './http';

/* Actions */

const getConfig = (headers) => http.get('/config', undefined, headers);

export default {
  getConfig,
};
