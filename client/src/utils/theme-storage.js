/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { Themes } from '../constants/Enums';

// Each user's choice of light, dark or the system's theme, kept in this browser.
// System is the default, so a new user starts out matching their device.

const CHANGE_EVENT = 'planka:themeChange';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const getKey = (userId) => `planka_theme_${userId}`;

export const getTheme = (userId) => {
  try {
    const theme = window.localStorage.getItem(getKey(userId));

    if (Object.values(Themes).includes(theme)) {
      return theme;
    }
  } catch {
    /* empty */
  }

  return Themes.SYSTEM;
};

export const setTheme = (userId, theme) => {
  try {
    if (theme === Themes.SYSTEM) {
      window.localStorage.removeItem(getKey(userId));
    } else {
      window.localStorage.setItem(getKey(userId), theme);
    }
  } catch {
    /* empty */
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const resolveTheme = (theme) => {
  if (theme !== Themes.SYSTEM) {
    return theme;
  }

  return window.matchMedia(DARK_QUERY).matches ? Themes.DARK : Themes.LIGHT;
};

export const subscribeToThemeChange = (callback) => {
  const mediaQueryList = window.matchMedia(DARK_QUERY);

  window.addEventListener(CHANGE_EVENT, callback);
  mediaQueryList.addEventListener('change', callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    mediaQueryList.removeEventListener('change', callback);
  };
};
