import EntryActionTypes from '../../constants/EntryActionTypes';

export const createListInCurrentBoard = (data) => ({
  type: EntryActionTypes.LIST_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

export const handleListCreate = (list) => ({
  type: EntryActionTypes.LIST_CREATE_HANDLE,
  payload: {
    list,
  },
});

export const updateList = (id, data) => ({
  type: EntryActionTypes.LIST_UPDATE,
  payload: {
    id,
    data,
  },
});

export const handleListUpdate = (list) => ({
  type: EntryActionTypes.LIST_UPDATE_HANDLE,
  payload: {
    list,
  },
});

export const moveList = (id, index) => ({
  type: EntryActionTypes.LIST_MOVE,
  payload: {
    id,
    index,
  },
});

export const deleteList = (id) => ({
  type: EntryActionTypes.LIST_DELETE,
  payload: {
    id,
  },
});

export const handleListDelete = (list) => ({
  type: EntryActionTypes.LIST_DELETE_HANDLE,
  payload: {
    list,
  },
});
