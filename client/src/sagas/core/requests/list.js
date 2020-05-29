import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createListFailed,
  createListRequested,
  createListSucceeded,
  deleteListFailed,
  deleteListRequested,
  deleteListSucceeded,
  updateListFailed,
  updateListRequested,
  updateListSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createListRequest(boardId, localId, data) {
  yield put(
    createListRequested(localId, {
      ...data,
      boardId,
    }),
  );

  try {
    const { item } = yield call(request, api.createList, boardId, data);

    const action = createListSucceeded(localId, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createListFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateListRequest(id, data) {
  yield put(updateListRequested(id, data));

  try {
    const { item } = yield call(request, api.updateList, id, data);

    const action = updateListSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateListFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteListRequest(id) {
  yield put(deleteListRequested(id));

  try {
    const { item } = yield call(request, api.deleteList, id);

    const action = deleteListSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteListFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
