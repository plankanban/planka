import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';

export function* fetchActivities(cardId) {
  const { isActivitiesDetailsVisible } = yield select(selectors.selectCardById, cardId);
  const lastId = yield select(selectors.selectLastActivityIdByCardId, cardId);

  yield put(actions.fetchActivities(cardId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getActivities, cardId, {
      beforeId: lastId,
      withDetails: isActivitiesDetailsVisible,
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

export function* toggleActivitiesDetails(cardId, isVisible) {
  yield put(actions.toggleActivitiesDetails(cardId, isVisible));

  if (isVisible) {
    let activities;
    let users;

    try {
      ({
        items: activities,
        included: { users },
      } = yield call(request, api.getActivities, cardId, {
        withDetails: isVisible,
      }));
    } catch (error) {
      yield put(actions.toggleActivitiesDetails.failure(cardId, error));
      return;
    }

    yield put(actions.toggleActivitiesDetails.success(cardId, activities, users));
  }
}

export function* toggleActivitiesDetailsInCurrentCard(isVisible) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(toggleActivitiesDetails, cardId, isVisible);
}

export function* handleActivityCreate(activity) {
  yield put(actions.handleActivityCreate(activity));
}

export function* handleActivityUpdate(activity) {
  yield put(actions.handleActivityUpdate(activity));
}

export function* handleActivityDelete(activity) {
  yield put(actions.handleActivityDelete(activity));
}

export default {
  fetchActivities,
  fetchActivitiesInCurrentCard,
  toggleActivitiesDetails,
  toggleActivitiesDetailsInCurrentCard,
  handleActivityCreate,
  handleActivityUpdate,
  handleActivityDelete,
};
