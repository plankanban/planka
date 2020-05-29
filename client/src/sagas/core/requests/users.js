import { call, put } from 'redux-saga/effects';

import request from './request';
import { fetchUsersFailed, fetchUsersRequested, fetchUsersSucceeded } from '../../../actions';
import api from '../../../api';

// eslint-disable-next-line import/prefer-default-export
export function* fetchUsersRequest() {
  yield put(fetchUsersRequested());

  try {
    const { items } = yield call(request, api.getUsers);

    const action = fetchUsersSucceeded(items);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = fetchUsersFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
