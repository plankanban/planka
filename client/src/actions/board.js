import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createBoard = (board) => ({
  type: ActionTypes.BOARD_CREATE,
  payload: {
    board,
  },
});

export const updateBoard = (id, data) => ({
  type: ActionTypes.BOARD_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteBoard = (id) => ({
  type: ActionTypes.BOARD_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createBoardRequested = (localId, data) => ({
  type: ActionTypes.BOARD_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createBoardSucceeded = (localId, board, lists, labels) => ({
  type: ActionTypes.BOARD_CREATE_SUCCEEDED,
  payload: {
    localId,
    board,
    lists,
    labels,
  },
});

export const createBoardFailed = (localId, error) => ({
  type: ActionTypes.BOARD_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const createBoardReceived = (board, lists, labels) => ({
  type: ActionTypes.BOARD_CREATE_RECEIVED,
  payload: {
    board,
    lists,
    labels,
  },
});

export const fetchBoardRequested = (id) => ({
  type: ActionTypes.BOARD_FETCH_REQUESTED,
  payload: {
    id,
  },
});

export const fetchBoardSucceeded = (
  board,
  labels,
  lists,
  cards,
  cardMemberships,
  cardLabels,
  tasks,
  attachments,
) => ({
  type: ActionTypes.BOARD_FETCH_SUCCEEDED,
  payload: {
    board,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
  },
});

export const fetchBoardFailed = (id, error) => ({
  type: ActionTypes.BOARD_FETCH_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateBoardRequested = (id, data) => ({
  type: ActionTypes.BOARD_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateBoardSucceeded = (board) => ({
  type: ActionTypes.BOARD_UPDATE_SUCCEEDED,
  payload: {
    board,
  },
});

export const updateBoardFailed = (id, error) => ({
  type: ActionTypes.BOARD_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateBoardReceived = (board) => ({
  type: ActionTypes.BOARD_UPDATE_RECEIVED,
  payload: {
    board,
  },
});

export const deleteBoardRequested = (id) => ({
  type: ActionTypes.BOARD_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteBoardSucceeded = (board) => ({
  type: ActionTypes.BOARD_DELETE_SUCCEEDED,
  payload: {
    board,
  },
});

export const deleteBoardFailed = (id, error) => ({
  type: ActionTypes.BOARD_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteBoardReceived = (board) => ({
  type: ActionTypes.BOARD_DELETE_RECEIVED,
  payload: {
    board,
  },
});
