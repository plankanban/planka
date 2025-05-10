/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* boardsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.BOARD_IN_CURRENT_PROJECT_CREATE, ({ payload: { data } }) =>
      services.createBoardInCurrentProject(data),
    ),
    takeEvery(
      EntryActionTypes.BOARD_CREATE_HANDLE,
      ({ payload: { board, boardMemberships, requestId } }) =>
        services.handleBoardCreate(board, boardMemberships, requestId),
    ),
    takeEvery(EntryActionTypes.BOARD_FETCH, ({ payload: { id } }) => services.fetchBoard(id)),
    takeEvery(EntryActionTypes.BOARD_UPDATE, ({ payload: { id, data } }) =>
      services.updateBoard(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_BOARD_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentBoard(data),
    ),
    takeEvery(EntryActionTypes.BOARD_UPDATE_HANDLE, ({ payload: { board } }) =>
      services.handleBoardUpdate(board),
    ),
    takeEvery(EntryActionTypes.BOARD_MOVE, ({ payload: { id, index } }) =>
      services.moveBoard(id, index),
    ),
    takeEvery(EntryActionTypes.CONTEXT_IN_CURRENT_BOARD_UPDATE, ({ payload: { value } }) =>
      services.updateContextInCurrentBoard(value),
    ),
    takeEvery(EntryActionTypes.VIEW_IN_CURRENT_BOARD_UPDATE, ({ payload: { value } }) =>
      services.updateViewInCurrentBoard(value),
    ),
    takeEvery(EntryActionTypes.IN_CURRENT_BOARD_SEARCH, ({ payload: { value } }) =>
      services.searchInCurrentBoard(value),
    ),
    takeEvery(EntryActionTypes.BOARD_DELETE, ({ payload: { id } }) => services.deleteBoard(id)),
    takeEvery(EntryActionTypes.BOARD_DELETE_HANDLE, ({ payload: { board } }) =>
      services.handleBoardDelete(board),
    ),
  ]);
}
