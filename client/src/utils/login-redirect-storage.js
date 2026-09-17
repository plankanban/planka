/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import matchPaths from './match-paths';
import Paths from '../constants/Paths';

// Where the next successful login should land: the in-app location this visit
// asked for before being bounced to the login screen, or the one it was sitting
// on when the session ended underneath it. The hand-off crosses a full page
// load — the logout flow sends the browser to /login — so the store and the
// history state are both gone by the time it is needed.
//
// Tab-scoped: the destination belongs to the interrupted visit, not to every
// tab open on this machine.

const KEY = 'planka:loginRedirect';

// Restorable destinations only: the ones Root renders and the core fetch can
// resolve from the path. /login would loop, and the root path is where a login
// lands anyway.
const RESTORABLE_PATHS = [Paths.PROJECTS, Paths.BOARDS, Paths.CARDS];

const isRestorable = (location) => {
  if (typeof location !== 'string' || location[0] !== '/') {
    return false;
  }

  // Browsers read `//host` and `/\host` as protocol-relative URLs, so a leading
  // slash alone doesn't make a value same-origin.
  if (location.startsWith('//') || location.startsWith('/\\')) {
    return false;
  }

  const [pathname] = location.split(/[?#]/);

  return !!matchPaths(pathname, RESTORABLE_PATHS);
};

export const setLoginRedirect = (location) => {
  // Anything unrestorable leaves an already-stored destination alone: the login
  // screen itself goes through here on every bounce, and clearing there would
  // drop what the previous session asked us to remember.
  if (!isRestorable(location)) {
    return;
  }

  try {
    window.sessionStorage.setItem(KEY, location);
  } catch {
    /* empty */
  }
};

export const removeLoginRedirect = () => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* empty */
  }
};

// Read and clear — a remembered destination is good for exactly one login.
export const takeLoginRedirect = () => {
  let location;

  try {
    location = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
  } catch {
    return null;
  }

  // Storage is user-writable, so the guard that kept the value out has to hold
  // again before anything navigates to it.
  return isRestorable(location) ? location : null;
};
