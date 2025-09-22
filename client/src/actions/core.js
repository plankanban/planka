/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initializeCore = (
  config,
  user,
  board,
  webhooks,
  users,
  projects,
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
  notifications,
  notificationServices,
) => ({
  type: ActionTypes.CORE_INITIALIZE,
  payload: {
    config,
    user,
    board,
    webhooks,
    users,
    projects,
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
    notifications,
    notificationServices,
  },
});

initializeCore.fetchBootstrap = (bootstrap) => ({
  type: ActionTypes.CORE_INITIALIZE__BOOTSTRAP_FETCH,
  payload: {
    bootstrap,
  },
});

const toggleFavorites = (isEnabled) => ({
  type: ActionTypes.FAVORITES_TOGGLE,
  payload: {
    isEnabled,
  },
});

const toggleEditMode = (isEnabled) => ({
  type: ActionTypes.EDIT_MODE_TOGGLE,
  payload: {
    isEnabled,
  },
});

const updateHomeView = (value) => ({
  type: ActionTypes.HOME_VIEW_UPDATE,
  payload: {
    value,
  },
});

const logout = () => ({
  type: ActionTypes.LOGOUT,
  payload: {},
});

logout.revokeAccessToken = () => ({
  type: ActionTypes.LOGOUT__ACCESS_TOKEN_REVOKE,
  payload: {},
});

export default {
  initializeCore,
  toggleFavorites,
  toggleEditMode,
  updateHomeView,
  logout,
};
