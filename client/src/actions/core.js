import ActionTypes from '../constants/ActionTypes';

const initializeCore = (
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
  activities,
  notifications,
) => ({
  type: ActionTypes.CORE_INITIALIZE,
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
    activities,
    notifications,
  },
});

const logout = () => ({
  type: ActionTypes.LOGOUT,
  payload: {},
});

logout.invalidateAccessToken = () => ({
  type: ActionTypes.LOGOUT__ACCESS_TOKEN_INVALIDATE,
  payload: {},
});

export default {
  initializeCore,
  logout,
};
