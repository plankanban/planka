import { call, put, select } from 'redux-saga/effects';

import { createTaskRequest, deleteTaskRequest, updateTaskRequest } from '../requests';
import { pathSelector } from '../../../selectors';
import { createTask, deleteTask, updateTask } from '../../../actions';
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

  yield call(createTaskRequest, cardId, localId, data);
}

export function* createTaskInCurrentCardService(data) {
  const { cardId } = yield select(pathSelector);

  yield call(createTaskService, cardId, data);
}

export function* updateTaskService(id, data) {
  yield put(updateTask(id, data));
  yield call(updateTaskRequest, id, data);
}

export function* deleteTaskService(id) {
  yield put(deleteTask(id));
  yield call(deleteTaskRequest, id);
}
