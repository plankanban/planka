import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createLabelFailed,
  createLabelRequested,
  createLabelSucceeded,
  deleteLabelFailed,
  deleteLabelRequested,
  deleteLabelSucceeded,
  updateLabelFailed,
  updateLabelRequested,
  updateLabelSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createLabelRequest(boardId, localId, data) {
  yield put(
    createLabelRequested(localId, {
      ...data,
      boardId,
    }),
  );

  try {
    const { item } = yield call(request, api.createLabel, boardId, data);

    const action = createLabelSucceeded(localId, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createLabelFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateLabelRequest(id, data) {
  yield put(updateLabelRequested(id, data));

  try {
    const { item } = yield call(request, api.updateLabel, id, data);

    const action = updateLabelSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateLabelFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteLabelRequest(id) {
  yield put(deleteLabelRequested(id));

  try {
    const { item } = yield call(request, api.deleteLabel, id);

    const action = deleteLabelSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteLabelFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
