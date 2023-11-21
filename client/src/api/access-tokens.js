import http from './http';
import socket from './socket';

/* Actions */

const createAccessToken = (data, headers) => http.post('/access-tokens', data, headers);

const exchangeForAccessTokenUsingOidc = (data, headers) =>
  http.post('/access-tokens/exchange-using-oidc', data, headers);

const deleteCurrentAccessToken = (headers) =>
  socket.delete('/access-tokens/me', undefined, headers);

export default {
  createAccessToken,
  exchangeForAccessTokenUsingOidc,
  deleteCurrentAccessToken,
};
