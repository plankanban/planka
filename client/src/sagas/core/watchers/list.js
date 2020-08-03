import { all, takeLatest } from 'redux-saga/effects';

import {
  createListInCurrentBoardService,
  deleteListService,
  moveListService,
  updateListService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* listWatchers() {
  yield all([
    takeLatest(EntryActionTypes.LIST_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      createListInCurrentBoardService(data),
    ),
    takeLatest(EntryActionTypes.LIST_UPDATE, ({ payload: { id, data } }) =>
      updateListService(id, data),
    ),
    takeLatest(EntryActionTypes.LIST_MOVE, ({ payload: { id, index } }) =>
      moveListService(id, index),
    ),
    takeLatest(EntryActionTypes.LIST_DELETE, ({ payload: { id } }) => deleteListService(id)),
  ]);
}
