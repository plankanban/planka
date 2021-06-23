import { all, takeEvery } from 'redux-saga/effects';

import {
  createListInCurrentBoardService,
  deleteListService,
  handleListCreateService,
  handleListDeleteService,
  handleListUpdateService,
  moveListService,
  updateListService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* listWatchers() {
  yield all([
    takeEvery(EntryActionTypes.LIST_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      createListInCurrentBoardService(data),
    ),
    takeEvery(EntryActionTypes.LIST_CREATE_HANDLE, ({ payload: { list } }) =>
      handleListCreateService(list),
    ),
    takeEvery(EntryActionTypes.LIST_UPDATE, ({ payload: { id, data } }) =>
      updateListService(id, data),
    ),
    takeEvery(EntryActionTypes.LIST_UPDATE_HANDLE, ({ payload: { list } }) =>
      handleListUpdateService(list),
    ),
    takeEvery(EntryActionTypes.LIST_MOVE, ({ payload: { id, index } }) =>
      moveListService(id, index),
    ),
    takeEvery(EntryActionTypes.LIST_DELETE, ({ payload: { id } }) => deleteListService(id)),
    takeEvery(EntryActionTypes.LIST_DELETE_HANDLE, ({ payload: { list } }) =>
      handleListDeleteService(list),
    ),
  ]);
}
