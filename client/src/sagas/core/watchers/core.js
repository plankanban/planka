import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* coreWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CORE_INITIALIZE, () => services.initializeCore()),
    takeEvery(EntryActionTypes.LOGOUT, () => services.logout()),
  ]);
}
