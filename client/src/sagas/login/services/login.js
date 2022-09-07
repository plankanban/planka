import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import { setAccessToken } from '../../../utils/access-token-storage';

export function* authenticate(data) {
  yield put(actions.authenticate(data));

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.createAccessToken, data));
  } catch (error) {
    yield put(actions.authenticate.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.authenticate.success(accessToken));
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export default {
  authenticate,
  clearAuthenticateError,
};
