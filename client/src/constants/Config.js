/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Read from server-injected config at runtime, fallback to empty string
const BASE_PATH =
  typeof window !== 'undefined' && window.PLANKA_CONFIG?.baseUrlPath
    ? window.PLANKA_CONFIG.baseUrlPath
    : '';

const ACCESS_TOKEN_KEY = 'accessToken';
const ACCESS_TOKEN_VERSION_KEY = 'accessTokenVersion';
const ACCESS_TOKEN_VERSION = '1';

const POSITION_GAP = 65536;
const CARDS_LIMIT = 50;
const COMMENTS_LIMIT = 50;
const ACTIVITIES_LIMIT = 50;

const MAX_SIZE_TO_DISPLAY_CONTENT = 256 * 1024;

const IS_MAC = navigator.platform.startsWith('Mac');

export default {
  BASE_PATH,
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_VERSION_KEY,
  ACCESS_TOKEN_VERSION,
  POSITION_GAP,
  CARDS_LIMIT,
  COMMENTS_LIMIT,
  ACTIVITIES_LIMIT,
  MAX_SIZE_TO_DISPLAY_CONTENT,
  IS_MAC,
};
