/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initializeCore = (
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

initializeCore.fetchConfig = (config) => ({
  type: ActionTypes.CORE_INITIALIZE__CONFIG_FETCH,
  payload: {
    config,
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

logout.invalidateAccessToken = () => ({
  type: ActionTypes.LOGOUT__ACCESS_TOKEN_INVALIDATE,
  payload: {},
});

export default {
  initializeCore,
  toggleFavorites,
  toggleEditMode,
  updateHomeView,
  logout,
};
