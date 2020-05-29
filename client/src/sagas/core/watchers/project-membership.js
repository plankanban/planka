import { all, takeLatest } from 'redux-saga/effects';

import {
  createMembershipInCurrentProjectService,
  deleteProjectMembershipService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* () {
  yield all([
    takeLatest(EntryActionTypes.MEMBERSHIP_IN_CURRENT_PROJECT_CREATE, ({ payload: { data } }) =>
      createMembershipInCurrentProjectService(data),
    ),
    takeLatest(EntryActionTypes.PROJECT_MEMBERSHIP_DELETE, ({ payload: { id } }) =>
      deleteProjectMembershipService(id),
    ),
  ]);
}
