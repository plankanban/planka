import { put, take } from 'redux-saga/effects';

import { logout } from '../../../actions';

// eslint-disable-next-line import/prefer-default-export
export function* logoutService() {
  yield put(logout());
  yield take();
}
