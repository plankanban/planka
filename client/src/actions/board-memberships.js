import ActionTypes from '../constants/ActionTypes';

const createBoardMembership = (boardMembership) => ({
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

const handleBoardMembershipCreate = (
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
  deletedNotifications,
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
    deletedNotifications,
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

const updateBoardMembership = (id, data) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

updateBoardMembership.success = (boardMembership) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_UPDATE__SUCCESS,
  payload: {
    boardMembership,
  },
});

updateBoardMembership.failure = (id, error) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardMembershipUpdate = (boardMembership) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    boardMembership,
  },
});

const deleteBoardMembership = (id) => ({
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

const handleBoardMembershipDelete = (boardMembership) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    boardMembership,
  },
});

export default {
  createBoardMembership,
  handleBoardMembershipCreate,
  updateBoardMembership,
  handleBoardMembershipUpdate,
  deleteBoardMembership,
  handleBoardMembershipDelete,
};
