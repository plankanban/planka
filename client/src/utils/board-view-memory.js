/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Which view a board was last put into, so a reload comes back to it rather
// than to the board's configured default. Choosing kanban and finding list
// again after every refresh is the board forgetting something the reader
// clearly meant.
//
// `sessionStorage`, not `localStorage`. A view is how one person is looking at
// a board right now, not a property of the board or of the account: two windows
// may hold the same board open as a grid and as a list, and neither is wrong.
// `localStorage` would make one of them change under the other's hands.
//
// The context is stored with the choice and has to match on the way back out.
// A view belongs to the context it was picked in — list makes sense in the
// trash, kanban does not — and a reload always lands a board in its own
// context, so an archive choice must not follow it there.

import { BoardViews } from '../constants/Enums';

const KEY = 'planka:boardView';

const VIEWS = new Set(Object.values(BoardViews));

const read = () => {
  try {
    const stored = window.sessionStorage.getItem(KEY);
    const parsed = stored ? JSON.parse(stored) : null;

    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const write = (views) => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(views));
  } catch {
    /* storage blocked or full — boards simply open in their default view */
  }
};

export const rememberBoardView = (boardId, context, view) => {
  write({ ...read(), [boardId]: { view, context } });
};

// Anything that does not survive both checks falls through to the board's own
// default: a view this build no longer has, or one picked in another context.
export const recallBoardView = (boardId, context) => {
  const stored = read()[boardId];

  if (!stored || stored.context !== context || !VIEWS.has(stored.view)) {
    return null;
  }

  return stored.view;
};

export const forgetBoardViews = () => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to do — the store was unreachable to begin with */
  }
};
