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

const deleteList = (id) => ({
  type: EntryActionTypes.LIST_DELETE,
  payload: {
    id,
  },
});

const handleListDelete = (list) => ({
  type: EntryActionTypes.LIST_DELETE_HANDLE,
  payload: {
    list,
  },
});

export default {
  createListInCurrentBoard,
  handleListCreate,
  updateList,
  handleListUpdate,
  moveList,
  deleteList,
  handleListDelete,
};
