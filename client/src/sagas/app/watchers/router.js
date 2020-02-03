import { takeEvery } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';

import { locationChangedService } from '../services';

export default function*() {
  yield takeEvery(LOCATION_CHANGE, () => locationChangedService());
}
