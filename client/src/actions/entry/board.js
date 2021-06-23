import EntryActionTypes from '../../constants/EntryActionTypes';

export const createBoardInCurrentProject = (data) => ({
  type: EntryActionTypes.BOARD_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

export const handleBoardCreate = (board) => ({
  type: EntryActionTypes.BOARD_CREATE_HANDLE,
  payload: {
    board,
  },
});

export const fetchBoard = (id) => ({
  type: EntryActionTypes.BOARD_FETCH,
  payload: {
    id,
  },
});

export const updateBoard = (id, data) => ({
  type: EntryActionTypes.BOARD_UPDATE,
  payload: {
    id,
    data,
  },
});

export const handleBoardUpdate = (board) => ({
  type: EntryActionTypes.BOARD_UPDATE_HANDLE,
  payload: {
    board,
  },
});

export const moveBoard = (id, index) => ({
  type: EntryActionTypes.BOARD_MOVE,
  payload: {
    id,
    index,
  },
});

export const deleteBoard = (id) => ({
  type: EntryActionTypes.BOARD_DELETE,
  payload: {
    id,
  },
});

export const handleBoardDelete = (board) => ({
  type: EntryActionTypes.BOARD_DELETE_HANDLE,
  payload: {
    board,
  },
});
