import Cookies from 'js-cookie';

import Config from '../constants/Config';

export const setAccessToken = (accessToken) => {
  Cookies.set(Config.ACCESS_TOKEN_KEY, accessToken, {
    expires: Config.ACCESS_TOKEN_EXPIRES,
  });
};

export const getAccessToken = () => Cookies.get(Config.ACCESS_TOKEN_KEY);

export const removeAccessToken = () => {
  Cookies.remove(Config.ACCESS_TOKEN_KEY);
};
