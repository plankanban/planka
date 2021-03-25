import { all, takeLatest } from 'redux-saga/effects';

import {
  createProjectService,
  deleteCurrentProjectService,
  importProjectService,
  updateCurrentProjectBackgroundImageService,
  updateCurrentProjectService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectWatchers() {
  yield all([
    takeLatest(EntryActionTypes.PROJECT_CREATE, ({ payload: { data } }) =>
      createProjectService(data),
    ),
    takeLatest(EntryActionTypes.IMPORT_PROJECT, ({ payload: { file } }) =>
      importProjectService(file),
    ),
    takeLatest(EntryActionTypes.CURRENT_PROJECT_UPDATE, ({ payload: { data } }) =>
      updateCurrentProjectService(data),
    ),
    takeLatest(EntryActionTypes.CURRENT_PROJECT_BACKGROUND_IMAGE_UPDATE, ({ payload: { data } }) =>
      updateCurrentProjectBackgroundImageService(data),
    ),
    takeLatest(EntryActionTypes.CURRENT_PROJECT_DELETE, () => deleteCurrentProjectService()),
  ]);
}
