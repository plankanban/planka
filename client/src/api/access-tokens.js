import http from './http';
import socket from './socket';

/* Actions */

const createAccessToken = (data, headers) => http.post('/access-tokens', data, headers);

const exchangeToAccessToken = (data, headers) =>
  http.post('/access-tokens/exchange', data, headers);

const deleteCurrentAccessToken = (headers) =>
  socket.delete('/access-tokens/me', undefined, headers);

export default {
  createAccessToken,
  exchangeToAccessToken,
  deleteCurrentAccessToken,
};
