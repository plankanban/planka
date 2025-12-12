/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import Config from '../constants/Config';

export const setAccessToken = (accessToken) => {
  const { exp } = jwtDecode(accessToken);
  const expires = new Date(exp * 1000);

  Cookies.set(Config.ACCESS_TOKEN_KEY, accessToken, {
    expires,
    path: Config.BASE_PATH || '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  });

  Cookies.set(Config.ACCESS_TOKEN_VERSION_KEY, Config.ACCESS_TOKEN_VERSION, {
    expires,
    path: Config.BASE_PATH || '/',
  });
};

export const removeAccessToken = () => {
  Cookies.remove(Config.ACCESS_TOKEN_KEY, { path: Config.BASE_PATH || '/' });
  Cookies.remove(Config.ACCESS_TOKEN_VERSION_KEY, { path: Config.BASE_PATH || '/' });
};

export const getAccessToken = () => {
  let accessToken = Cookies.get(Config.ACCESS_TOKEN_KEY);
  const accessTokenVersion = Cookies.get(Config.ACCESS_TOKEN_VERSION_KEY);

  if (accessToken && accessTokenVersion !== Config.ACCESS_TOKEN_VERSION) {
    removeAccessToken();
    accessToken = undefined;
  }

  return accessToken;
};
