import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { pathSelector } from '../../../selectors';
import {
  createTask,
  deleteTask,
  handleTaskCreate,
  handleTaskDelete,
  handleTaskUpdate,
  updateTask,
} from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createTaskService(cardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    createTask({
      ...data,
      cardId,
      id: localId,
    }),
  );

  let task;
  try {
    ({ item: task } = yield call(request, api.createTask, cardId, data));
  } catch (error) {
    yield put(createTask.failure(localId, error));
    return;
  }

  yield put(createTask.success(localId, task));
}

export function* createTaskInCurrentCardService(data) {
  const { cardId } = yield select(pathSelector);

  yield call(createTaskService, cardId, data);
}

export function* handleTaskCreateService(task) {
  yield put(handleTaskCreate(task));
}

export function* updateTaskService(id, data) {
  yield put(updateTask(id, data));

  let task;
  try {
    ({ item: task } = yield call(request, api.updateTask, id, data));
  } catch (error) {
    yield put(updateTask.failure(id, error));
    return;
  }

  yield put(updateTask.success(task));
}

export function* handleTaskUpdateService(task) {
  yield put(handleTaskUpdate(task));
}

export function* deleteTaskService(id) {
  yield put(deleteTask(id));

  let task;
  try {
    ({ item: task } = yield call(request, api.deleteTask, id));
  } catch (error) {
    yield put(deleteTask.failure(id, error));
    return;
  }

  yield put(deleteTask.success(task));
}

export function* handleTaskDeleteService(task) {
  yield put(handleTaskDelete(task));
}
