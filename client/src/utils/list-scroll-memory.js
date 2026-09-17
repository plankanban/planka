/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Where each list was scrolled to, so it opens where it was left rather than at
// the top. A long list scrolled to the part being worked on is a place, and
// losing it on every board switch makes the board feel forgetful.
//
// Scoped to one project at a time. Moving between the boards of a project keeps
// what each list was showing; arriving at a different project starts clean, so
// nobody walks into a board and watches its columns jump to somewhere the last
// project left them. Only one project's worth is held, which is what makes that
// arrival silent: there is nothing to restore, so nothing moves.
//
// `sessionStorage`, not `localStorage`, for the same reason the board view is.
// A scroll position belongs to a window, not to an account: two windows on one
// board are two people looking at two places, and both are right. A shared
// store would drag one along with the other, and a list would move under
// somebody's hands with nothing to blame it on.
//
// Version-suffixed. An offset is a plain reachable number, so a store written
// under rules that turned out to be wrong cannot be told apart from a good one
// — corrected code would restore it and look like it had changed nothing.
// Bumping the suffix abandons the lot, and costs nothing: the store dies with
// the window anyway.

const KEY = 'planka:listScroll:2';

const read = () => {
  try {
    const stored = window.sessionStorage.getItem(KEY);
    const parsed = stored ? JSON.parse(stored) : null;

    return parsed && typeof parsed === 'object' && parsed.positions ? parsed : null;
  } catch {
    return null;
  }
};

const write = (projectId, positions) => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ projectId, positions }));
  } catch {
    /* storage blocked or full — lists simply open at the top */
  }
};

export const rememberListScroll = (projectId, listId, scrollTop) => {
  if (!projectId || !listId) {
    return;
  }

  const stored = read();

  // Another project's worth: this one replaces it rather than joins it.
  const positions = stored && stored.projectId === projectId ? stored.positions : {};

  // Nothing to say about a list sitting at its top, and leaving those out keeps
  // the record to the lists actually being worked in.
  if (scrollTop > 0) {
    positions[listId] = Math.round(scrollTop);
  } else {
    delete positions[listId];
  }

  write(projectId, positions);
};

export const recallListScroll = (projectId, listId) => {
  if (!projectId || !listId) {
    return null;
  }

  const stored = read();

  if (!stored) {
    return null;
  }

  // Another project's positions. Dropped here, on the first list of the new
  // project to ask, rather than left to be replaced by the first scroll: a
  // project is entered and left as a whole, and coming back to one should start
  // it fresh whether or not anything happened to be scrolled in between.
  if (stored.projectId !== projectId) {
    write(projectId, {});
    return null;
  }

  const scrollTop = stored.positions[listId];

  return typeof scrollTop === 'number' && scrollTop > 0 ? scrollTop : null;
};

export const forgetListScrolls = () => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to do — the store was unreachable to begin with */
  }
};
