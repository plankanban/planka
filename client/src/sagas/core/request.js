import { call, fork, join, put, take } from 'redux-saga/effects';

import { logout } from '../../actions';
import ErrorCodes from '../../constants/ErrorCodes';

let lastRequestTask;

function* queueRequest(method, ...args) {
  if (lastRequestTask) {
    try {
      yield join(lastRequestTask);
    } catch {} // eslint-disable-line no-empty
  }

  try {
    return yield call(method, ...args);
  } catch (error) {
    if (error.code === ErrorCodes.UNAUTHORIZED) {
      yield put(logout()); // TODO: next url
      yield take();
    }

    throw error;
  }
}

export default function* request(method, ...args) {
  lastRequestTask = yield fork(queueRequest, method, ...args);

  return yield join(lastRequestTask);
}
