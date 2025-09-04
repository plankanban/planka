/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* listsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.LIST_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      services.createListInCurrentBoard(data),
    ),
    takeEvery(EntryActionTypes.LIST_CREATE_HANDLE, ({ payload: { list } }) =>
      services.handleListCreate(list),
    ),
    takeEvery(EntryActionTypes.LIST_UPDATE, ({ payload: { id, data } }) =>
      services.updateList(id, data),
    ),
    takeEvery(EntryActionTypes.LIST_UPDATE_HANDLE, ({ payload: { list } }) =>
      services.handleListUpdate(list),
    ),
    takeEvery(EntryActionTypes.LIST_MOVE, ({ payload: { id, index } }) =>
      services.moveList(id, index),
    ),
    takeEvery(EntryActionTypes.LIST_TRANSFER, ({ payload: { id, boardId, index } }) =>
      services.transferList(id, boardId, index),
    ),
    takeEvery(EntryActionTypes.LIST_SORT, ({ payload: { id, data } }) =>
      services.sortList(id, data),
    ),
    takeEvery(EntryActionTypes.LIST_CARDS_TO_ARCHIVE_LIST_MOVE, ({ payload: { id } }) =>
      services.moveListCardsToArchiveList(id),
    ),
    takeEvery(EntryActionTypes.TRASH_LIST_IN_CURRENT_BOARD_CLEAR, () =>
      services.clearTrashListInCurrentBoard(),
    ),
    takeEvery(EntryActionTypes.LIST_CLEAR_HANDLE, ({ payload: { list } }) =>
      services.handleListClear(list),
    ),
    takeEvery(EntryActionTypes.LIST_DELETE, ({ payload: { id } }) => services.deleteList(id)),
    takeEvery(EntryActionTypes.LIST_DELETE_HANDLE, ({ payload: { list, cards } }) =>
      services.handleListDelete(list, cards),
    ),
  ]);
}
