/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createBoardInCurrentProject = (data) => ({
  type: EntryActionTypes.BOARD_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleBoardCreate = (board, boardMemberships, requestId) => ({
  type: EntryActionTypes.BOARD_CREATE_HANDLE,
  payload: {
    board,
    boardMemberships,
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

const updateCurrentBoard = (data) => ({
  type: EntryActionTypes.CURRENT_BOARD_UPDATE,
  payload: {
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

const updateContextInCurrentBoard = (value) => ({
  type: EntryActionTypes.CONTEXT_IN_CURRENT_BOARD_UPDATE,
  payload: {
    value,
  },
});

const updateViewInCurrentBoard = (value) => ({
  type: EntryActionTypes.VIEW_IN_CURRENT_BOARD_UPDATE,
  payload: {
    value,
  },
});

const searchInCurrentBoard = (value) => ({
  type: EntryActionTypes.IN_CURRENT_BOARD_SEARCH,
  payload: {
    value,
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
  updateCurrentBoard,
  handleBoardUpdate,
  moveBoard,
  updateContextInCurrentBoard,
  updateViewInCurrentBoard,
  searchInCurrentBoard,
  deleteBoard,
  handleBoardDelete,
};
