import { call, put } from 'redux-saga/effects';

import { authenticateRequest } from '../requests';
import { authenticate, clearAuthenticateError } from '../../../actions';

export function* authenticateService(data) {
  yield put(authenticate(data));
  yield call(authenticateRequest, data);
}

export function* clearAuthenticateErrorService() {
  yield put(clearAuthenticateError());
}
