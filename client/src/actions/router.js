import ActionTypes from '../constants/ActionTypes';

const handleLocationChange = (
  board,
  users,
  projects,
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
  type: ActionTypes.LOCATION_CHANGE_HANDLE,
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
    tasks,
    attachments,
    deletedNotifications,
  },
});

handleLocationChange.fetchBoard = (id) => ({
  type: ActionTypes.LOCATION_CHANGE_HANDLE__BOARD_FETCH,
  payload: {
    id,
  },
});

export default {
  handleLocationChange,
};
