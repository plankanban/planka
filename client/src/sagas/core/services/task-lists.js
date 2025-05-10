/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
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

export default {
  createTaskList,
  createTaskListInCurrentCard,
  handleTaskListCreate,
  updateTaskList,
  handleTaskListUpdate,
  moveTaskList,
  deleteTaskList,
  handleTaskListDelete,
};
