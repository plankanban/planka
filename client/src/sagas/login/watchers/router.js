import { takeEvery } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'redux-first-history';

import services from '../services';

export default function* routerWatchers() {
  yield takeEvery(LOCATION_CHANGE, () => services.handleLocationChange());
}
