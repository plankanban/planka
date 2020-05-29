import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createTaskFailed,
  createTaskRequested,
  createTaskSucceeded,
  deleteTaskFailed,
  deleteTaskRequested,
  deleteTaskSucceeded,
  updateTaskFailed,
  updateTaskRequested,
  updateTaskSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createTaskRequest(cardId, localId, data) {
  yield put(
    createTaskRequested(localId, {
      ...data,
      cardId,
    }),
  );

  try {
    const { item } = yield call(request, api.createTask, cardId, data);

    const action = createTaskSucceeded(localId, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createTaskFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateTaskRequest(id, data) {
  yield put(updateTaskRequested(id, data));

  try {
    const { item } = yield call(request, api.updateTask, id, data);

    const action = updateTaskSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateTaskFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteTaskRequest(id) {
  yield put(deleteTaskRequested(id));

  try {
    const { item } = yield call(request, api.deleteTask, id);

    const action = deleteTaskSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteTaskFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
