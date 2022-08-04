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
  deletedNotifications,
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
    deletedNotifications,
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

const deleteProjectManager = (id, isCurrentUser, isCurrentProject) => ({
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

const handleProjectManagerDelete = (projectManager, isCurrentUser, isCurrentProject) => ({
  type: ActionTypes.PROJECT_MANAGER_DELETE_HANDLE,
  payload: {
    projectManager,
    isCurrentUser,
    isCurrentProject,
  },
});

export default {
  createProjectManager,
  handleProjectManagerCreate,
  deleteProjectManager,
  handleProjectManagerDelete,
};
