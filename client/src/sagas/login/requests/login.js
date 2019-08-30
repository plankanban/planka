import { call, put } from 'redux-saga/effects';

import { authenticateFailed, authenticateRequested, authenticateSucceeded } from '../../../actions';
import api from '../../../api';

// eslint-disable-next-line import/prefer-default-export
export function* authenticateRequest(data) {
  yield put(authenticateRequested(data));

  try {
    const { item } = yield call(api.createAccessToken, data);

    const action = authenticateSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = authenticateFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
