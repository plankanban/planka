import { takeEvery } from 'redux-saga/effects';
import { LOCATION_CHANGE_HANDLE } from '../../../lib/redux-router';

import services from '../services';

export default function* routerWatchers() {
  yield takeEvery(LOCATION_CHANGE_HANDLE, () => services.handleLocationChange());
}
