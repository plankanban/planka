import EntryActionTypes from '../constants/EntryActionTypes';

const createBoardInCurrentProject = (data) => ({
  type: EntryActionTypes.BOARD_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleBoardCreate = (board, requestId) => ({
  type: EntryActionTypes.BOARD_CREATE_HANDLE,
  payload: {
    board,
    requestId,
  },
});

const fetchBoard = (id) => ({
  type: EntryActionTypes.BOARD_FETCH,
  payload: {
    id,
  },
});

const updateBoard = (id, data) => ({
  type: EntryActionTypes.BOARD_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleBoardUpdate = (board) => ({
  type: EntryActionTypes.BOARD_UPDATE_HANDLE,
  payload: {
    board,
  },
});

const moveBoard = (id, index) => ({
  type: EntryActionTypes.BOARD_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteBoard = (id) => ({
  type: EntryActionTypes.BOARD_DELETE,
  payload: {
    id,
  },
});

const handleBoardDelete = (board) => ({
  type: EntryActionTypes.BOARD_DELETE_HANDLE,
  payload: {
    board,
  },
});

export default {
  createBoardInCurrentProject,
  handleBoardCreate,
  fetchBoard,
  updateBoard,
  handleBoardUpdate,
  moveBoard,
  deleteBoard,
  handleBoardDelete,
};
