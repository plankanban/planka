/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* apiKeysWatchers() {
  yield all([
    takeEvery(EntryActionTypes.API_KEY_CREATE, ({ payload: { userId } }) =>
      services.createApiKey(userId),
    ),
    takeEvery(EntryActionTypes.API_KEY_CYCLE, ({ payload: { userId } }) =>
      services.cycleApiKey(userId),
    ),
    takeEvery(EntryActionTypes.API_KEY_DELETE, ({ payload: { userId } }) =>
      services.deleteApiKey(userId),
    ),
  ]);
}
