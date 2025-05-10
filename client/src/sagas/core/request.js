/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, join, put, select, spawn, take } from 'redux-saga/effects';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import ErrorCodes from '../../constants/ErrorCodes';

let lastRequestTask;

function* queueRequest(method, ...args) {
  if (lastRequestTask) {
    try {
      yield join(lastRequestTask);
    } catch {
      /* empty */
    }
  }

  const accessToken = yield select(selectors.selectAccessToken);

  try {
    return yield call(method, ...args, {
      Authorization: `Bearer ${accessToken}`,
    });
  } catch (error) {
    if (error.code === ErrorCodes.UNAUTHORIZED) {
      yield put(entryActions.logout(false));
      yield take();
    }

    throw error;
  }
}

export default function* request(method, ...args) {
  lastRequestTask = yield spawn(queueRequest, method, ...args);

  return yield join(lastRequestTask);
}
