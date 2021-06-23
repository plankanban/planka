import { all, takeEvery } from 'redux-saga/effects';

import {
  createProjectService,
  deleteCurrentProjectService,
  handleProjectCreateService,
  handleProjectDeleteService,
  handleProjectUpdateService,
  updateCurrentProjectBackgroundImageService,
  updateCurrentProjectService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_CREATE, ({ payload: { data } }) =>
      createProjectService(data),
    ),
    takeEvery(EntryActionTypes.PROJECT_CREATE_HANDLE, ({ payload: { project } }) =>
      handleProjectCreateService(project),
    ),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_UPDATE, ({ payload: { data } }) =>
      updateCurrentProjectService(data),
    ),
    takeEvery(EntryActionTypes.PROJECT_UPDATE_HANDLE, ({ payload: { project } }) =>
      handleProjectUpdateService(project),
    ),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_BACKGROUND_IMAGE_UPDATE, ({ payload: { data } }) =>
      updateCurrentProjectBackgroundImageService(data),
    ),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_DELETE, () => deleteCurrentProjectService()),
    takeEvery(EntryActionTypes.PROJECT_DELETE_HANDLE, ({ payload: { project } }) =>
      handleProjectDeleteService(project),
    ),
  ]);
}
