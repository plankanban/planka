import { takeEvery } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';

import services from '../services';

export default function* routerWatchers() {
  yield takeEvery(LOCATION_CHANGE, () => services.handleLocationChange());
}
