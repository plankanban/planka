/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';

export function* searchLocations(cardId, query) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 3) {
    yield put(actions.clearLocationSearch());
    return;
  }

  yield put(actions.searchLocations(cardId, trimmedQuery));

  let body;
  try {
    body = yield call(request, api.searchLocations, cardId, trimmedQuery);
  } catch (error) {
    yield put(actions.searchLocations.failure(cardId, error));
    return;
  }

  yield put(actions.searchLocations.success(cardId, body.items));
}

export function* clearLocationSearchResults() {
  yield put(actions.clearLocationSearch());
}

export default {
  searchLocations,
  clearLocationSearchResults,
};
