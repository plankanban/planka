/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const toggleFavorites = (isEnabled) => ({
  type: EntryActionTypes.FAVORITES_TOGGLE,
  payload: {
    isEnabled,
  },
});

const toggleEditMode = (isEnabled) => ({
  type: EntryActionTypes.EDIT_MODE_TOGGLE,
  payload: {
    isEnabled,
  },
});

// Put the caret in the board filter's search field. Carries no state of its
// own — the filter bar is always on screen, so there is nothing to open. Routed
// through the store because the `f` shortcut fires from a different branch of
// the tree than the field lives in.
const focusBoardFilter = () => ({
  type: EntryActionTypes.BOARD_FILTER_FOCUS,
  payload: {},
});

const updateHomeView = (value) => ({
  type: EntryActionTypes.HOME_VIEW_UPDATE,
  payload: {
    value,
  },
});

const logout = (revokeAccessToken = true) => ({
  type: EntryActionTypes.LOGOUT,
  payload: {
    revokeAccessToken,
  },
});

const dismissAutoLogoutWarning = () => ({
  type: EntryActionTypes.AUTO_LOGOUT_WARNING_DISMISS,
  payload: {},
});

export default {
  toggleFavorites,
  toggleEditMode,
  focusBoardFilter,
  updateHomeView,
  logout,
  dismissAutoLogoutWarning,
};
