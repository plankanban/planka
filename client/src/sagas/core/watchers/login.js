import { takeEvery } from 'redux-saga/effects';

import { logoutService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* loginWatchers() {
  yield takeEvery(EntryActionTypes.LOGOUT, () => logoutService());
}
