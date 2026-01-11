/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
import { createLocalId } from '../../../utils/local-id';

export function* createTaskList(cardId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextTaskListPosition, cardId),
  };

  yield put(
    actions.createTaskList({
      ...nextData,
      cardId,
      id: localId,
    }),
  );

  let taskList;
  try {
    ({ item: taskList } = yield call(request, api.createTaskList, cardId, nextData));
  } catch (error) {
    yield put(actions.createTaskList.failure(localId, error));
    return;
  }

  yield put(actions.createTaskList.success(localId, taskList));
}

export function* createTaskListInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createTaskList, cardId, data);
}

export function* handleTaskListCreate(taskList) {
  yield put(actions.handleTaskListCreate(taskList));
}

export function* updateTaskList(id, data) {
  yield put(actions.updateTaskList(id, data));

  let taskList;
  try {
    ({ item: taskList } = yield call(request, api.updateTaskList, id, data));
  } catch (error) {
    yield put(actions.updateTaskList.failure(id, error));
    return;
  }

  yield put(actions.updateTaskList.success(taskList));
}

export function* handleTaskListUpdate(taskList) {
  yield put(actions.handleTaskListUpdate(taskList));
}

export function* moveTaskList(id, index) {
  const { cardId } = yield select(selectors.selectTaskListById, id);
  const position = yield select(selectors.selectNextTaskListPosition, cardId, index, id);

  yield call(updateTaskList, id, {
    position,
  });
}

export function* deleteTaskList(id) {
  yield put(actions.deleteTaskList(id));

  let taskList;
  try {
    ({ item: taskList } = yield call(request, api.deleteTaskList, id));
  } catch (error) {
    yield put(actions.deleteTaskList.failure(id, error));
    return;
  }

  yield put(actions.deleteTaskList.success(taskList));
}

export function* handleTaskListDelete(taskList) {
  yield put(actions.handleTaskListDelete(taskList));
}

export function* duplicateTaskList(id, data = {}) {
  const localId = yield call(createLocalId);

  const sourceTaskList = yield select(selectors.selectTaskListById, id);

  if (!sourceTaskList) {
    return;
  }

  const tasks = yield select(selectors.selectTasksByTaskListId, id);

  const nextData = {
    ...data,
    name: data.name || `${sourceTaskList.name} (${i18n.t('common.copy', { context: 'inline' })})`,
    position: data.position || (yield select(selectors.selectNextTaskListPosition, sourceTaskList.cardId)),
  };

  yield put(
    actions.createTaskList({
      ...nextData,
      cardId: sourceTaskList.cardId,
      id: localId,
    }),
  );

  let newTaskList;
  try {
    ({ item: newTaskList } = yield call(request, api.createTaskList, sourceTaskList.cardId, nextData));
  } catch (error) {
    yield put(actions.createTaskList.failure(localId, error));
    return;
  }

  yield put(actions.createTaskList.success(localId, newTaskList));

  // Duplicate tasks: reuse tasks service so position and localId handling is consistent
  for (let i = 0; i < tasks.length; i += 1) {
    const task = tasks[i];

    try {
      // call the tasks service to create tasks with optimistic behaviour
      // require is used to avoid circular import issues
      yield call(require('./tasks').createTask, newTaskList.id, {
        name: task.name,
        isCompleted: task.isCompleted,
        linkedCardId: task.linkedCardId,
        assigneeUserId: task.assigneeUserId,
      });
    } catch (e) {
      // continue on error; consider rollback in further iterations
    }
  }

  // Optionally: dispatch a duplicateTaskList.success action if needed
}

export default {
  createTaskList,
  createTaskListInCurrentCard,
  handleTaskListCreate,
  updateTaskList,
  handleTaskListUpdate,
  moveTaskList,
  deleteTaskList,
  handleTaskListDelete,
  duplicateTaskList,
};
