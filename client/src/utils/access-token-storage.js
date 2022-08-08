import Cookies from 'js-cookie';

import Config from '../constants/Config';
import socket from '../api/socket';

export const setAccessToken = (accessToken) => {
  Cookies.set(Config.ACCESS_TOKEN_KEY, accessToken, {
    expires: Config.ACCESS_TOKEN_EXPIRES,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  });
  Cookies.set(Config.ACCESS_TOKEN_VERSION_KEY, Config.ACCESS_TOKEN_VERSION, {
    expires: Config.ACCESS_TOKEN_EXPIRES,
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
