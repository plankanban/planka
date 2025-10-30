/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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

const handleBoardCreate = (board, boardMemberships) => ({
  type: ActionTypes.BOARD_CREATE_HANDLE,
  payload: {
    board,
    boardMemberships,
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
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
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
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
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

const updateBoardContext = (id, value) => ({
  type: ActionTypes.BOARD_CONTEXT_UPDATE,
  payload: {
    id,
    value,
  },
});

const searchInBoard = (id, value, currentListId) => ({
  type: ActionTypes.IN_BOARD_SEARCH,
  payload: {
    id,
    value,
    currentListId,
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

const moveBoardToProject = (id, targetProjectId) => ({
  type: ActionTypes.BOARD_MOVE_TO_PROJECT,
  payload: {
    id,
    targetProjectId,
  },
});

moveBoardToProject.success = (board, lists, cards) => ({
  type: ActionTypes.BOARD_MOVE_TO_PROJECT__SUCCESS,
  payload: {
    board,
    lists,
    cards,
  },
});

moveBoardToProject.failure = (id, error) => ({
  type: ActionTypes.BOARD_MOVE_TO_PROJECT__FAILURE,
  payload: {
    id,
    error,
  },
});

export default {
  createBoard,
  handleBoardCreate,
  fetchBoard,
  updateBoard,
  handleBoardUpdate,
  updateBoardContext,
  searchInBoard,
  deleteBoard,
  handleBoardDelete,
  moveBoardToProject,
};
