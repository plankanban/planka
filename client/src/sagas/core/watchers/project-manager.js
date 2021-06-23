import { all, takeEvery } from 'redux-saga/effects';

import {
  createManagerInCurrentProjectService,
  deleteProjectManagerService,
  handleProjectManagerCreateService,
  handleProjectManagerDeleteService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectManagerWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MANAGER_IN_CURRENT_PROJECT_CREATE, ({ payload: { data } }) =>
      createManagerInCurrentProjectService(data),
    ),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_CREATE_HANDLE, ({ payload: { projectManager } }) =>
      handleProjectManagerCreateService(projectManager),
    ),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_DELETE, ({ payload: { id } }) =>
      deleteProjectManagerService(id),
    ),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_DELETE_HANDLE, ({ payload: { projectManager } }) =>
      handleProjectManagerDeleteService(projectManager),
    ),
  ]);
}
