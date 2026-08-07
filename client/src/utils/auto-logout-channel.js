/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const CHANNEL_NAME = 'planka-auto-logout';
const STORAGE_KEY = 'planka:auto-logout-message';

const TAB_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const supportsBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window;

let channel = null;
const listeners = new Set();

const dispatch = (message) => {
  listeners.forEach((listener) => {
    try {
      listener(message);
    } catch {
      /* empty */
    }
  });
};

const handleStorageEvent = (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) {
    return;
  }
  try {
    const message = JSON.parse(event.newValue);
    if (message && message.tabId !== TAB_ID) {
      dispatch(message);
    }
  } catch {
    /* empty */
  }
};

const ensureChannel = () => {
  if (channel || typeof window === 'undefined') {
    return;
  }

  if (supportsBroadcastChannel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', (event) => {
      if (event.data && event.data.tabId !== TAB_ID) {
        dispatch(event.data);
      }
    });
  } else {
    window.addEventListener('storage', handleStorageEvent);
    channel = { fallback: true };
  }
};

const post = (message) => {
  ensureChannel();
  if (!channel) {
    return;
  }

  const payload = { ...message, tabId: TAB_ID };

  if (channel.fallback) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, _ts: Date.now() }));
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* empty */
    }
  } else {
    channel.postMessage(payload);
  }
};

export const postActivity = () => post({ type: 'activity' });

export const postLogout = () => post({ type: 'logout' });

export const postStayLoggedIn = () => post({ type: 'stay-logged-in' });

export const subscribe = (handler) => {
  ensureChannel();
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
};
