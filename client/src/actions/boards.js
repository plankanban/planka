import ActionTypes from '../constants/ActionTypes';

const createBoard = (board) => ({
  type: ActionTypes.BOARD_CREATE,
  payload: {
    board,
  },
});

createBoard.success = (localId, board, boardMemberships) => ({
  type: ActionTypes.BOARD_CREATE__SUCCESS,
  payload: {
    localId,
    board,
    boardMemberships,
  },
});

createBoard.failure = (localId, error) => ({
  type: ActionTypes.BOARD_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleBoardCreate = (board) => ({
  type: ActionTypes.BOARD_CREATE_HANDLE,
  payload: {
    board,
  },
});

const fetchBoard = (id) => ({
  type: ActionTypes.BOARD_FETCH,
  payload: {
    id,
  },
});

fetchBoard.success = (
  board,
  users,
  projects,
  boardMemberships,
  labels,
  lists,
  cards,
  cardMemberships,
  cardLabels,
  tasks,
  attachments,
) => ({
  type: ActionTypes.BOARD_FETCH__SUCCESS,
  payload: {
    board,
    users,
    projects,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
  },
});

fetchBoard.failure = (id, error) => ({
  type: ActionTypes.BOARD_FETCH__FAILURE,
  payload: {
    id,
    error,
  },
});

const updateBoard = (id, data) => ({
  type: ActionTypes.BOARD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateBoard.success = (board) => ({
  type: ActionTypes.BOARD_UPDATE__SUCCESS,
  payload: {
    board,
  },
});

updateBoard.failure = (id, error) => ({
  type: ActionTypes.BOARD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardUpdate = (board) => ({
  type: ActionTypes.BOARD_UPDATE_HANDLE,
  payload: {
    board,
  },
});

const deleteBoard = (id) => ({
  type: ActionTypes.BOARD_DELETE,
  payload: {
    id,
  },
});

deleteBoard.success = (board) => ({
  type: ActionTypes.BOARD_DELETE__SUCCESS,
  payload: {
    board,
  },
});

deleteBoard.failure = (id, error) => ({
  type: ActionTypes.BOARD_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardDelete = (board) => ({
  type: ActionTypes.BOARD_DELETE_HANDLE,
  payload: {
    board,
  },
});

export default {
  createBoard,
  handleBoardCreate,
  fetchBoard,
  updateBoard,
  handleBoardUpdate,
  deleteBoard,
  handleBoardDelete,
};
