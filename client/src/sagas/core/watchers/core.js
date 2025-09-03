/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* coreWatchers() {
  yield all([
    takeEvery(EntryActionTypes.FAVORITES_TOGGLE, ({ payload: { isEnabled } }) =>
      services.toggleFavorites(isEnabled),
    ),
    takeEvery(EntryActionTypes.EDIT_MODE_TOGGLE, ({ payload: { isEnabled } }) =>
      services.toggleEditMode(isEnabled),
    ),
    takeEvery(EntryActionTypes.HOME_VIEW_UPDATE, ({ payload: { value } }) =>
      services.updateHomeView(value),
    ),
    takeEvery(EntryActionTypes.LOGOUT, ({ payload: { revokeAccessToken } }) =>
      services.logout(revokeAccessToken),
    ),
  ]);
}
