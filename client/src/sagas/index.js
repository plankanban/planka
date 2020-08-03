import { call, select } from 'redux-saga/effects';

import loginSaga from './login';
import coreSaga from './core';
import { accessTokenSelector } from '../selectors';

export default function* rootSaga() {
  const accessToken = yield select(accessTokenSelector);

  if (!accessToken) {
    yield call(loginSaga);
  }

  yield call(coreSaga);
}
