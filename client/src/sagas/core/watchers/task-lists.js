/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* taskListsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.TASK_LIST_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      services.createTaskListInCurrentCard(data),
    ),
    takeEvery(EntryActionTypes.TASK_LIST_CREATE_HANDLE, ({ payload: { taskList } }) =>
      services.handleTaskListCreate(taskList),
    ),
    takeEvery(EntryActionTypes.TASK_LIST_UPDATE, ({ payload: { id, data } }) =>
      services.updateTaskList(id, data),
    ),
    takeEvery(EntryActionTypes.TASK_LIST_UPDATE_HANDLE, ({ payload: { taskList } }) =>
      services.handleTaskListUpdate(taskList),
    ),
    takeEvery(EntryActionTypes.TASK_LIST_MOVE, ({ payload: { id, index } }) =>
      services.moveTaskList(id, index),
    ),
    takeEvery(EntryActionTypes.TASK_LIST_DELETE, ({ payload: { id } }) =>
      services.deleteTaskList(id),
    ),
    takeEvery(EntryActionTypes.TASK_LIST_DELETE_HANDLE, ({ payload: { taskList } }) =>
      services.handleTaskListDelete(taskList),
    ),
  ]);
}
