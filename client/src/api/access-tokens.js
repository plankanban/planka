import http from './http';

/* Actions */

const createAccessToken = (data, headers) =>
  http.post('/access-tokens?withHttpOnlyToken=true', data, headers);

const exchangeForAccessTokenUsingOidc = (data, headers) =>
  http.post('/access-tokens/exchange-using-oidc?withHttpOnlyToken=true', data, headers);

const deleteCurrentAccessToken = (headers) => http.delete('/access-tokens/me', undefined, headers);

export default {
  createAccessToken,
  exchangeForAccessTokenUsingOidc,
  deleteCurrentAccessToken,
};
