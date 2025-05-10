/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleLocationChange = (
  pathname,
  currentBoardId,
  currentCardId,
  isEditModeEnabled,
  board,
  users,
  projects,
  boardMemberships,
  labels,
  lists,
  cards,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
  notificationsToDelete,
) => ({
  type: ActionTypes.LOCATION_CHANGE_HANDLE,
  payload: {
    pathname,
    currentBoardId,
    currentCardId,
    isEditModeEnabled,
    board,
    users,
    projects,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
    notificationsToDelete,
  },
});

handleLocationChange.fetchContent = () => ({
  type: ActionTypes.LOCATION_CHANGE_HANDLE__CONTENT_FETCH,
  payload: {},
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
