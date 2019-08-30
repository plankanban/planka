import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createCommentActionFailed,
  createCommentActionRequested,
  createCommentActionSucceeded,
  deleteCommentActionFailed,
  deleteCommentActionRequested,
  deleteCommentActionSucceeded,
  updateCommentActionFailed,
  updateCommentActionRequested,
  updateCommentActionSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createCommentActionRequest(cardId, localId, data) {
  yield put(
    createCommentActionRequested(localId, {
      ...data,
      cardId,
    }),
  );

  try {
    const { item } = yield call(request, api.createCommentAction, cardId, data);

    const action = createCommentActionSucceeded(localId, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createCommentActionFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateCommentActionRequest(id, data) {
  yield put(
    updateCommentActionRequested(id, {
      data,
    }),
  );

  try {
    const { item } = yield call(request, api.updateCommentAction, id, data);

    const action = updateCommentActionSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateCommentActionFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteCommentActionRequest(id) {
  yield put(deleteCommentActionRequested(id));

  try {
    const { item } = yield call(request, api.deleteCommentAction, id);

    const action = deleteCommentActionSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteCommentActionFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
