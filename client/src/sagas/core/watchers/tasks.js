/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* tasksWatchers() {
  yield all([
    takeEvery(EntryActionTypes.TASK_CREATE, ({ payload: { taskListId, data } }) =>
      services.createTask(taskListId, data),
    ),
    takeEvery(EntryActionTypes.TASK_CREATE_HANDLE, ({ payload: { task } }) =>
      services.handleTaskCreate(task),
    ),
    takeEvery(EntryActionTypes.TASK_UPDATE, ({ payload: { id, data } }) =>
      services.updateTask(id, data),
    ),
    takeEvery(EntryActionTypes.TASK_UPDATE_HANDLE, ({ payload: { task } }) =>
      services.handleTaskUpdate(task),
    ),
    takeEvery(EntryActionTypes.TASK_MOVE, ({ payload: { id, taskListId, index } }) =>
      services.moveTask(id, taskListId, index),
    ),
    takeEvery(EntryActionTypes.TASK_DELETE, ({ payload: { id } }) => services.deleteTask(id)),
    takeEvery(EntryActionTypes.TASK_DELETE_HANDLE, ({ payload: { task } }) =>
      services.handleTaskDelete(task),
    ),
  ]);
}
