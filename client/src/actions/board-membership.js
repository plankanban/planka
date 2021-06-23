import ActionTypes from '../constants/ActionTypes';

export const createBoardMembership = (boardMembership) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_CREATE,
  payload: {
    boardMembership,
  },
});

createBoardMembership.success = (localId, boardMembership) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_CREATE__SUCCESS,
  payload: {
    localId,
    boardMembership,
  },
});

createBoardMembership.failure = (localId, error) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

export const handleBoardMembershipCreate = (
  boardMembership,
  project,
  board,
  users,
  projectManagers,
  boards,
  boardMemberships,
  labels,
  lists,
  cards,
  cardMemberships,
  cardLabels,
  tasks,
  attachments,
) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    boardMembership,
    project,
    board,
    users,
    projectManagers,
    boards,
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

handleBoardMembershipCreate.fetchProject = (id, currentUserId, currentBoardId) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE__PROJECT_FETCH,
  payload: {
    id,
    currentUserId,
    currentBoardId,
  },
});

export const deleteBoardMembership = (id) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

deleteBoardMembership.success = (boardMembership) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE__SUCCESS,
  payload: {
    boardMembership,
  },
});

deleteBoardMembership.failure = (id, error) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleBoardMembershipDelete = (boardMembership) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    boardMembership,
  },
});
