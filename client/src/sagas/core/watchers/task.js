import { all, takeEvery } from 'redux-saga/effects';

import {
  createTaskInCurrentCardService,
  deleteTaskService,
  handleTaskCreateService,
  handleTaskDeleteService,
  handleTaskUpdateService,
  updateTaskService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* taskWatchers() {
  yield all([
    takeEvery(EntryActionTypes.TASK_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      createTaskInCurrentCardService(data),
    ),
    takeEvery(EntryActionTypes.TASK_CREATE_HANDLE, ({ payload: { task } }) =>
      handleTaskCreateService(task),
    ),
    takeEvery(EntryActionTypes.TASK_UPDATE, ({ payload: { id, data } }) =>
      updateTaskService(id, data),
    ),
    takeEvery(EntryActionTypes.TASK_UPDATE_HANDLE, ({ payload: { task } }) =>
      handleTaskUpdateService(task),
    ),
    takeEvery(EntryActionTypes.TASK_DELETE, ({ payload: { id } }) => deleteTaskService(id)),
    takeEvery(EntryActionTypes.TASK_DELETE_HANDLE, ({ payload: { task } }) =>
      handleTaskDeleteService(task),
    ),
  ]);
}
