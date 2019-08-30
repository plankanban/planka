import { call, select, put } from 'redux-saga/effects';

import { accessTokenSelector } from '../../../selectors';
import { logout } from '../../../actions';
import ErrorCodes from '../../../constants/ErrorCodes';

export default function* (method, ...args) {
  try {
    const accessToken = yield select(accessTokenSelector);

    return yield call(method, ...args, {
      Authorization: `Bearer ${accessToken}`,
    });
  } catch (error) {
    if (error.code === ErrorCodes.UNAUTHORIZED) {
      yield put(logout()); // TODO: next url
    }

    throw error;
  }
}
