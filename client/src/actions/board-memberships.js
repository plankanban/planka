/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
  isProjectAvailable,
  project,
  board,
  users,
  projectManagers,
  backgroundImages,
  baseCustomFieldGroups,
  boards,
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
  notificationServices,
) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    boardMembership,
    isProjectAvailable,
    project,
    board,
    users,
    projectManagers,
    backgroundImages,
    baseCustomFieldGroups,
    boards,
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
    notificationServices,
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

const deleteBoardMembership = (id, isCurrentUser) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE,
  payload: {
    id,
    isCurrentUser,
  },
});

deleteBoardMembership.success = (boardMembership, isCurrentUser) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE__SUCCESS,
  payload: {
    boardMembership,
    isCurrentUser,
  },
});

deleteBoardMembership.failure = (id, error) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardMembershipDelete = (boardMembership, isCurrentUser) => ({
  type: ActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    boardMembership,
    isCurrentUser,
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
