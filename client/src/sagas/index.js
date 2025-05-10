/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, select } from 'redux-saga/effects';

import loginSaga from './login';
import coreSaga from './core';
import selectors from '../selectors';

export default function* rootSaga() {
  const accessToken = yield select(selectors.selectAccessToken);

  if (!accessToken) {
    yield call(loginSaga);
  }

  yield call(coreSaga);
}
