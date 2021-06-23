import EntryActionTypes from '../../constants/EntryActionTypes';

export const createMembershipInCurrentBoard = (data) => ({
  type: EntryActionTypes.MEMBERSHIP_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

export const handleBoardMembershipCreate = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    boardMembership,
  },
});

export const deleteBoardMembership = (id) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

export const handleBoardMembershipDelete = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    boardMembership,
  },
});
