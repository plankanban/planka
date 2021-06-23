import { all, takeEvery } from 'redux-saga/effects';

import {
  createMembershipInCurrentBoardService,
  deleteBoardMembershipService,
  handleBoardMembershipCreateService,
  handleBoardMembershipDeleteService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* boardMembershipWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MEMBERSHIP_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      createMembershipInCurrentBoardService(data),
    ),
    takeEvery(EntryActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE, ({ payload: { boardMembership } }) =>
      handleBoardMembershipCreateService(boardMembership),
    ),
    takeEvery(EntryActionTypes.BOARD_MEMBERSHIP_DELETE, ({ payload: { id } }) =>
      deleteBoardMembershipService(id),
    ),
    takeEvery(EntryActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE, ({ payload: { boardMembership } }) =>
      handleBoardMembershipDeleteService(boardMembership),
    ),
  ]);
}
