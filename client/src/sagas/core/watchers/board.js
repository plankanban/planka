import { all, takeEvery } from 'redux-saga/effects';

import {
  createBoardInCurrentProjectService,
  deleteBoardService,
  fetchBoardService,
  handleBoardCreateService,
  handleBoardDeleteService,
  handleBoardUpdateService,
  moveBoardService,
  updateBoardService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* boardWatchers() {
  yield all([
    takeEvery(EntryActionTypes.BOARD_IN_CURRENT_PROJECT_CREATE, ({ payload: { data } }) =>
      createBoardInCurrentProjectService(data),
    ),
    takeEvery(EntryActionTypes.BOARD_CREATE_HANDLE, ({ payload: { board } }) =>
      handleBoardCreateService(board),
    ),
    takeEvery(EntryActionTypes.BOARD_FETCH, ({ payload: { id } }) => fetchBoardService(id)),
    takeEvery(EntryActionTypes.BOARD_UPDATE, ({ payload: { id, data } }) =>
      updateBoardService(id, data),
    ),
    takeEvery(EntryActionTypes.BOARD_UPDATE_HANDLE, ({ payload: { board } }) =>
      handleBoardUpdateService(board),
    ),
    takeEvery(EntryActionTypes.BOARD_MOVE, ({ payload: { id, index } }) =>
      moveBoardService(id, index),
    ),
    takeEvery(EntryActionTypes.BOARD_DELETE, ({ payload: { id } }) => deleteBoardService(id)),
    takeEvery(EntryActionTypes.BOARD_DELETE_HANDLE, ({ payload: { board } }) =>
      handleBoardDeleteService(board),
    ),
  ]);
}
