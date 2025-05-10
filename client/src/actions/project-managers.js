/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createProjectManager = (projectManager) => ({
  type: ActionTypes.PROJECT_MANAGER_CREATE,
  payload: {
    projectManager,
  },
});

createProjectManager.success = (localId, projectManager) => ({
  type: ActionTypes.PROJECT_MANAGER_CREATE__SUCCESS,
  payload: {
    localId,
    projectManager,
  },
});

createProjectManager.failure = (localId, error) => ({
  type: ActionTypes.PROJECT_MANAGER_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleProjectManagerCreate = (
  projectManager,
  boardIds,
  isCurrentUser,
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
  type: ActionTypes.PROJECT_MANAGER_CREATE_HANDLE,
  payload: {
    projectManager,
    boardIds,
    isCurrentUser,
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

const deleteProjectManager = (id) => ({
  type: ActionTypes.PROJECT_MANAGER_DELETE,
  payload: {
    id,
  },
});

deleteProjectManager.success = (projectManager) => ({
  type: ActionTypes.PROJECT_MANAGER_DELETE__SUCCESS,
  payload: {
    projectManager,
  },
});

deleteProjectManager.failure = (id, error) => ({
  type: ActionTypes.PROJECT_MANAGER_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectManagerDelete = (projectManager) => ({
  type: ActionTypes.PROJECT_MANAGER_DELETE_HANDLE,
  payload: {
    projectManager,
  },
});

export default {
  createProjectManager,
  handleProjectManagerCreate,
  deleteProjectManager,
  handleProjectManagerDelete,
};
