/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* modalsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MODAL_OPEN, ({ payload: { type, params } }) =>
      services.openModal(type, params),
    ),
    takeEvery(EntryActionTypes.MODAL_CLOSE, () => services.closeModal()),
  ]);
}
