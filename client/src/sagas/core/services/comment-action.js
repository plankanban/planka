import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { currentUserIdSelector, pathSelector } from '../../../selectors';
import { createCommentAction, deleteCommentAction, updateCommentAction } from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import { ActionTypes } from '../../../constants/Enums';

export function* createCommentActionService(cardId, data) {
  const localId = yield call(createLocalId);
  const userId = yield select(currentUserIdSelector);

  yield put(
    createCommentAction({
      cardId,
      userId,
      data,
      id: localId,
      type: ActionTypes.COMMENT_CARD,
    }),
  );

  let action;
  try {
    ({ item: action } = yield call(request, api.createCommentAction, cardId, data));
  } catch (error) {
    yield put(createCommentAction.failure(localId, error));
    return;
  }

  yield put(createCommentAction.success(localId, action));
}

export function* createCommentActionInCurrentCardService(data) {
  const { cardId } = yield select(pathSelector);

  yield call(createCommentActionService, cardId, data);
}

export function* updateCommentActionService(id, data) {
  yield put(updateCommentAction(id, data));

  let action;
  try {
    ({ item: action } = yield call(request, api.updateCommentAction, id, data));
  } catch (error) {
    yield put(updateCommentAction.failure(id, error));
    return;
  }

  yield put(updateCommentAction.success(action));
}

export function* deleteCommentActionService(id) {
  yield put(deleteCommentAction(id));

  let action;
  try {
    ({ item: action } = yield call(request, api.deleteCommentAction, id));
  } catch (error) {
    yield put(deleteCommentAction.failure(id, error));
    return;
  }

  yield put(deleteCommentAction.success(action));
}
