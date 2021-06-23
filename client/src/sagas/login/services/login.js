import { call, put } from 'redux-saga/effects';

import { authenticate, clearAuthenticateError } from '../../../actions';
import api from '../../../api';

export function* authenticateService(data) {
  yield put(authenticate(data));

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.createAccessToken, data));
  } catch (error) {
    yield put(authenticate.failure(error));
    return;
  }

  yield put(authenticate.success(accessToken));
}

export function* clearAuthenticateErrorService() {
  yield put(clearAuthenticateError());
}
