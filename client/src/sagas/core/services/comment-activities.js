import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import { ActivityTypes } from '../../../constants/Enums';

export function* createCommentActivity(cardId, data) {
  const localId = yield call(createLocalId);
  const userId = yield select(selectors.selectCurrentUserId);

  yield put(
    actions.createCommentActivity({
      cardId,
      userId,
      data,
      id: localId,
      type: ActivityTypes.COMMENT_CARD,
    }),
  );

  let activity;
  try {
    ({ item: activity } = yield call(request, api.createCommentActivity, cardId, data));
  } catch (error) {
    yield put(actions.createCommentActivity.failure(localId, error));
    return;
  }

  yield put(actions.createCommentActivity.success(localId, activity));
}

export function* createCommentActivityInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createCommentActivity, cardId, data);
}

export function* updateCommentActivity(id, data) {
  yield put(actions.updateCommentActivity(id, data));

  let activity;
  try {
    ({ item: activity } = yield call(request, api.updateCommentActivity, id, data));
  } catch (error) {
    yield put(actions.updateCommentActivity.failure(id, error));
    return;
  }

  yield put(actions.updateCommentActivity.success(activity));
}

export function* deleteCommentActivity(id) {
  yield put(actions.deleteCommentActivity(id));

  let activity;
  try {
    ({ item: activity } = yield call(request, api.deleteCommentActivity, id));
  } catch (error) {
    yield put(actions.deleteCommentActivity.failure(id, error));
    return;
  }

  yield put(actions.deleteCommentActivity.success(activity));
}

export default {
  createCommentActivity,
  createCommentActivityInCurrentCard,
  updateCommentActivity,
  deleteCommentActivity,
};
