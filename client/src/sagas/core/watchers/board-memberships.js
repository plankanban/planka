/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* boardMembershipsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MEMBERSHIP_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      services.createMembershipInCurrentBoard(data),
    ),
    takeEvery(
      EntryActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE,
      ({ payload: { boardMembership, users } }) =>
        services.handleBoardMembershipCreate(boardMembership, users),
    ),
    takeEvery(EntryActionTypes.BOARD_MEMBERSHIP_UPDATE, ({ payload: { id, data } }) =>
      services.updateBoardMembership(id, data),
    ),
    takeEvery(EntryActionTypes.BOARD_MEMBERSHIP_UPDATE_HANDLE, ({ payload: { boardMembership } }) =>
      services.handleBoardMembershipUpdate(boardMembership),
    ),
    takeEvery(EntryActionTypes.BOARD_MEMBERSHIP_DELETE, ({ payload: { id } }) =>
      services.deleteBoardMembership(id),
    ),
    takeEvery(EntryActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE, ({ payload: { boardMembership } }) =>
      services.handleBoardMembershipDelete(boardMembership),
    ),
  ]);
}
