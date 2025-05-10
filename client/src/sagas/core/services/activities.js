/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';

export function* fetchActivities(cardId) {
  const { lastActivityId } = yield select(selectors.selectCardById, cardId);

  yield put(actions.fetchActivities(cardId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getActivities, cardId, {
      beforeId: lastActivityId || undefined,
    }));
  } catch (error) {
    yield put(actions.fetchActivities.failure(cardId, error));
    return;
  }

  yield put(actions.fetchActivities.success(cardId, activities, users));
}

export function* fetchActivitiesInCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(fetchActivities, cardId);
}

export function* handleActivityCreate(activity) {
  yield put(actions.handleActivityCreate(activity));
}

export default {
  fetchActivities,
  fetchActivitiesInCurrentCard,
  handleActivityCreate,
};
