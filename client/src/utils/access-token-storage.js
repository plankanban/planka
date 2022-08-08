import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

import Config from '../constants/Config';
import socket from '../api/socket';

export const setAccessToken = (accessToken) => {
  const { exp } = jwtDecode(accessToken);
  const expires = exp !== undefined ? new Date(exp * 1000) : 365;

  Cookies.set(Config.ACCESS_TOKEN_KEY, accessToken, {
    expires,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  });
  Cookies.set(Config.ACCESS_TOKEN_VERSION_KEY, Config.ACCESS_TOKEN_VERSION, {
    expires,
  });

  socket.headers = { Cookie: document.cookie };
};

export const getAccessToken = () => {
  // TODO: remove migration
  const accessToken = Cookies.get(Config.ACCESS_TOKEN_KEY);
  const accessTokenVersion = Cookies.get(Config.ACCESS_TOKEN_VERSION_KEY);
  if (accessToken && accessTokenVersion !== Config.ACCESS_TOKEN_VERSION) {
    // Add secure and sameSite attributes to the cookie
    setAccessToken(accessToken);
  }

  return accessToken;
};

export const removeAccessToken = () => {
  Cookies.remove(Config.ACCESS_TOKEN_KEY);
};
