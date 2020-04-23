import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createAttachmentFailed,
  createAttachmentRequested,
  createAttachmentSucceeded,
  deleteAttachmentFailed,
  deleteAttachmentRequested,
  deleteAttachmentSucceeded,
  updateAttachmentFailed,
  updateAttachmentRequested,
  updateAttachmentSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createAttachmentRequest(cardId, localId, data) {
  yield put(
    createAttachmentRequested(localId, {
      ...data,
      cardId,
    }),
  );

  try {
    const { item } = yield call(request, api.createAttachment, cardId, data, localId);

    const action = createAttachmentSucceeded(localId, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createAttachmentFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateAttachmentRequest(id, data) {
  yield put(updateAttachmentRequested(id, data));

  try {
    const { item } = yield call(request, api.updateAttachment, id, data);

    const action = updateAttachmentSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateAttachmentFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteAttachmentRequest(id) {
  yield put(deleteAttachmentRequested(id));

  try {
    const { item } = yield call(request, api.deleteAttachment, id);

    const action = deleteAttachmentSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteAttachmentFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
