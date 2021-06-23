import ActionTypes from '../constants/ActionTypes';

export const handleSocketDisconnect = () => ({
  type: ActionTypes.SOCKET_DISCONNECT_HANDLE,
  payload: {},
});

export const handleSocketReconnect = (
  user,
  board,
  users,
  projects,
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
  actions,
  notifications,
) => ({
  type: ActionTypes.SOCKET_RECONNECT_HANDLE,
  payload: {
    user,
    board,
    users,
    projects,
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
    actions,
    notifications,
  },
});

handleSocketReconnect.fetchCore = (currentUserId, currentBoardId) => ({
  type: ActionTypes.SOCKET_RECONNECT_HANDLE__CORE_FETCH,
  payload: {
    currentUserId,
    currentBoardId,
  },
});
