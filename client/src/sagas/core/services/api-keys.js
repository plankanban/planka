/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';

export function* createApiKey(userId) {
  yield put(actions.createApiKey(userId));

  let apiKey;
  try {
    ({
      item: { apiKey },
    } = yield call(request, api.createApiKey, userId));
  } catch (error) {
    yield put(actions.createApiKey.failure(userId, error));
    return;
  }

  yield put(actions.createApiKey.success(userId, apiKey));
}

export function* cycleApiKey(userId) {
  yield put(actions.cycleApiKey(userId));

  let apiKey;
  try {
    ({
      item: { apiKey },
    } = yield call(request, api.cycleApiKey, userId));
  } catch (error) {
    yield put(actions.cycleApiKey.failure(userId, error));
    return;
  }

  yield put(actions.cycleApiKey.success(userId, apiKey));
}

export function* deleteApiKey(userId) {
  yield put(actions.deleteApiKey(userId));

  try {
    yield call(request, api.deleteApiKey, userId);
  } catch (error) {
    yield put(actions.deleteApiKey.failure(userId, error));
    return;
  }

  yield put(actions.deleteApiKey.success(userId));
}

export default {
  createApiKey,
  cycleApiKey,
  deleteApiKey,
};
