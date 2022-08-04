import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createTask(cardId, data) {
  const nextData = {
    ...data,
    position: yield select(selectors.selectNextTaskPosition, cardId),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createTask({
      ...nextData,
      cardId,
      id: localId,
    }),
  );

  let task;
  try {
    ({ item: task } = yield call(request, api.createTask, cardId, nextData));
  } catch (error) {
    yield put(actions.createTask.failure(localId, error));
    return;
  }

  yield put(actions.createTask.success(localId, task));
}

export function* createTaskInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createTask, cardId, data);
}

export function* handleTaskCreate(task) {
  yield put(actions.handleTaskCreate(task));
}

export function* updateTask(id, data) {
  yield put(actions.updateTask(id, data));

  let task;
  try {
    ({ item: task } = yield call(request, api.updateTask, id, data));
  } catch (error) {
    yield put(actions.updateTask.failure(id, error));
    return;
  }

  yield put(actions.updateTask.success(task));
}

export function* handleTaskUpdate(task) {
  yield put(actions.handleTaskUpdate(task));
}

export function* moveTask(id, index) {
  const { cardId } = yield select(selectors.selectTaskById, id);
  const position = yield select(selectors.selectNextTaskPosition, cardId, index, id);

  yield call(updateTask, id, {
    position,
  });
}

export function* deleteTask(id) {
  yield put(actions.deleteTask(id));

  let task;
  try {
    ({ item: task } = yield call(request, api.deleteTask, id));
  } catch (error) {
    yield put(actions.deleteTask.failure(id, error));
    return;
  }

  yield put(actions.deleteTask.success(task));
}

export function* handleTaskDelete(task) {
  yield put(actions.handleTaskDelete(task));
}

export default {
  createTask,
  createTaskInCurrentCard,
  handleTaskCreate,
  updateTask,
  handleTaskUpdate,
  moveTask,
  deleteTask,
  handleTaskDelete,
};
