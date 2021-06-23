import { takeEvery } from 'redux-saga/effects';

import { initializeCoreService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* coreWatchers() {
  yield takeEvery(EntryActionTypes.CORE_INITIALIZE, () => initializeCoreService());
}
