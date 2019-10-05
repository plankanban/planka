import { call, put } from 'redux-saga/effects';

import { authenticateRequest } from '../requests';
import { authenticate, clearAuthenticationError } from '../../../actions';

export function* authenticateService(data) {
  yield put(authenticate(data));
  yield call(authenticateRequest, data);
}

export function* clearAuthenticationErrorService() {
  yield put(clearAuthenticationError());
}
