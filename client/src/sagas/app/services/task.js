import { call, put, select } from 'redux-saga/effects';

import { createTaskRequest, deleteTaskRequest, updateTaskRequest } from '../requests';
import { maxIdSelector, pathSelector } from '../../../selectors';
import { createTask, deleteTask, updateTask } from '../../../actions';
import { nextLocalId } from '../../../utils/local-id';
import { Task } from '../../../models';

export function* createTaskService(cardId, data) {
  const localId = nextLocalId(yield select(maxIdSelector, Task.modelName));

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
