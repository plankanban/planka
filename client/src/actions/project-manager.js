import ActionTypes from '../constants/ActionTypes';

export const createProjectManager = (projectManager) => ({
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

export const handleProjectManagerCreate = (
  projectManager,
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
) => ({
  type: ActionTypes.PROJECT_MANAGER_CREATE_HANDLE,
  payload: {
    projectManager,
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
  },
});

handleProjectManagerCreate.fetchProject = (id, currentUserId, currentBoardId) => ({
  type: ActionTypes.PROJECT_MANAGER_CREATE_HANDLE__PROJECT_FETCH,
  payload: {
    id,
    currentUserId,
    currentBoardId,
  },
});

export const deleteProjectManager = (id, isCurrentUser, isCurrentProject) => ({
  type: ActionTypes.PROJECT_MANAGER_DELETE,
  payload: {
    id,
    isCurrentUser,
    isCurrentProject,
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

export const handleProjectManagerDelete = (projectManager, isCurrentUser, isCurrentProject) => ({
  type: ActionTypes.PROJECT_MANAGER_DELETE_HANDLE,
  payload: {
    projectManager,
    isCurrentUser,
    isCurrentProject,
  },
});
