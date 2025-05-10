/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createMembershipInCurrentBoard = (data) => ({
  type: EntryActionTypes.MEMBERSHIP_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const handleBoardMembershipCreate = (boardMembership, users) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    boardMembership,
    users,
  },
});

const updateBoardMembership = (id, data) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleBoardMembershipUpdate = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    boardMembership,
  },
});

const deleteBoardMembership = (id) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

const handleBoardMembershipDelete = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    boardMembership,
  },
});

export default {
  createMembershipInCurrentBoard,
  handleBoardMembershipCreate,
  updateBoardMembership,
  handleBoardMembershipUpdate,
  deleteBoardMembership,
  handleBoardMembershipDelete,
};
