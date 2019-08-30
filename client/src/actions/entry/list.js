import EntryActionTypes from '../../constants/EntryActionTypes';

export const createListInCurrentBoard = (data) => ({
  type: EntryActionTypes.LIST_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

export const updateList = (id, data) => ({
  type: EntryActionTypes.LIST_UPDATE,
  payload: {
    id,
    data,
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
