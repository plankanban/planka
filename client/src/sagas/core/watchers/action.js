import { all, takeEvery } from 'redux-saga/effects';

import {
  handleActionCreateService,
  handleActionDeleteService,
  handleActionUpdateService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* actionWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ACTION_CREATE_HANDLE, ({ payload: { action } }) =>
      handleActionCreateService(action),
    ),
    takeEvery(EntryActionTypes.ACTION_UPDATE_HANDLE, ({ payload: { action } }) =>
      handleActionUpdateService(action),
    ),
    takeEvery(EntryActionTypes.ACTION_DELETE_HANDLE, ({ payload: { action } }) =>
      handleActionDeleteService(action),
    ),
  ]);
}
