import { all, takeLatest } from 'redux-saga/effects';

import {
  createBoardInCurrentProjectService,
  deleteBoardService,
  fetchBoard,
  moveBoardService,
  updateBoardService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* boardWatchers() {
  yield all([
    takeLatest(EntryActionTypes.BOARD_IN_CURRENT_PROJECT_CREATE, ({ payload: { data } }) =>
      createBoardInCurrentProjectService(data),
    ),
    takeLatest(EntryActionTypes.BOARD_FETCH, ({ payload: { id } }) => fetchBoard(id)),
    takeLatest(EntryActionTypes.BOARD_UPDATE, ({ payload: { id, data } }) =>
      updateBoardService(id, data),
    ),
    takeLatest(EntryActionTypes.BOARD_MOVE, ({ payload: { id, index } }) =>
      moveBoardService(id, index),
    ),
    takeLatest(EntryActionTypes.BOARD_DELETE, ({ payload: { id } }) => deleteBoardService(id)),
  ]);
}
