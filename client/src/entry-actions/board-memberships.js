import EntryActionTypes from '../constants/EntryActionTypes';

const createMembershipInCurrentBoard = (data) => ({
  type: EntryActionTypes.MEMBERSHIP_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const handleBoardMembershipCreate = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE,
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
  deleteBoardMembership,
  handleBoardMembershipDelete,
};
