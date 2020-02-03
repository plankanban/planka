import { call, select } from 'redux-saga/effects';

import loginSaga from './login';
import appSaga from './app';
import { accessTokenSelector } from '../selectors';

export default function*() {
  const accessToken = yield select(accessTokenSelector);

  if (!accessToken) {
    yield call(loginSaga);
  }

  yield call(appSaga);
}
