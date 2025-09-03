/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createListInCurrentBoard = (data) => ({
  type: EntryActionTypes.LIST_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const handleListCreate = (list) => ({
  type: EntryActionTypes.LIST_CREATE_HANDLE,
  payload: {
    list,
  },
});

const updateList = (id, data) => ({
  type: EntryActionTypes.LIST_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleListUpdate = (list) => ({
  type: EntryActionTypes.LIST_UPDATE_HANDLE,
  payload: {
    list,
  },
});

const moveList = (id, index) => ({
  type: EntryActionTypes.LIST_MOVE,
  payload: {
    id,
    index,
  },
});

const transferList = (id, boardId, index = 0) => ({
  type: EntryActionTypes.LIST_TRANSFER,
  payload: {
    id,
    boardId,
    index,
  },
});

const sortList = (id, data) => {
  return {
    type: EntryActionTypes.LIST_SORT,
    payload: {
      id,
      data,
    },
  };
};

const moveListCardsToArchiveList = (id) => ({
  type: EntryActionTypes.LIST_CARDS_TO_ARCHIVE_LIST_MOVE,
  payload: {
    id,
  },
});

const clearTrashListInCurrentBoard = () => ({
  type: EntryActionTypes.TRASH_LIST_IN_CURRENT_BOARD_CLEAR,
  payload: {},
});

const handleListClear = (list) => ({
  type: EntryActionTypes.LIST_CLEAR_HANDLE,
  payload: {
    list,
  },
});

const deleteList = (id) => ({
  type: EntryActionTypes.LIST_DELETE,
  payload: {
    id,
  },
});

const handleListDelete = (list, cards) => ({
  type: EntryActionTypes.LIST_DELETE_HANDLE,
  payload: {
    list,
    cards,
  },
});

export default {
  createListInCurrentBoard,
  handleListCreate,
  updateList,
  handleListUpdate,
  moveList,
  transferList,
  sortList,
  moveListCardsToArchiveList,
  clearTrashListInCurrentBoard,
  handleListClear,
  deleteList,
  handleListDelete,
};
