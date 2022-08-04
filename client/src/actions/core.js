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

export default {
  initializeCore,
  logout,
};
