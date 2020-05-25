import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createProject = (data) => ({
  type: ActionTypes.PROJECT_CREATE,
  payload: {
    data,
  },
});

export const updateProject = (id, data) => ({
  type: ActionTypes.PROJECT_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteProject = (id) => ({
  type: ActionTypes.PROJECT_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createProjectRequested = (data) => ({
  type: ActionTypes.PROJECT_CREATE_REQUESTED,
  payload: {
    data,
  },
});

export const createProjectSucceeded = (project, users, projectMemberships, boards) => ({
  type: ActionTypes.PROJECT_CREATE_SUCCEEDED,
  payload: {
    project,
    users,
    projectMemberships,
    boards,
  },
});

export const createProjectFailed = (error) => ({
  type: ActionTypes.PROJECT_CREATE_FAILED,
  payload: {
    error,
  },
});

export const createProjectReceived = (project, users, projectMemberships, boards) => ({
  type: ActionTypes.PROJECT_CREATE_RECEIVED,
  payload: {
    project,
    users,
    projectMemberships,
    boards,
  },
});

export const updateProjectRequested = (id, data) => ({
  type: ActionTypes.PROJECT_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateProjectSucceeded = (project) => ({
  type: ActionTypes.PROJECT_UPDATE_SUCCEEDED,
  payload: {
    project,
  },
});

export const updateProjectFailed = (id, error) => ({
  type: ActionTypes.PROJECT_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateProjectReceived = (project) => ({
  type: ActionTypes.PROJECT_UPDATE_RECEIVED,
  payload: {
    project,
  },
});

export const updateProjectBackgroundImageRequested = (id) => ({
  type: ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE_REQUESTED,
  payload: {
    id,
  },
});

export const updateProjectBackgroundImageSucceeded = (project) => ({
  type: ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE_SUCCEEDED,
  payload: {
    project,
  },
});

export const updateProjectBackgroundImageFailed = (id, error) => ({
  type: ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteProjectRequested = (id) => ({
  type: ActionTypes.PROJECT_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteProjectSucceeded = (project) => ({
  type: ActionTypes.PROJECT_DELETE_SUCCEEDED,
  payload: {
    project,
  },
});

export const deleteProjectFailed = (id, error) => ({
  type: ActionTypes.PROJECT_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteProjectReceived = (project) => ({
  type: ActionTypes.PROJECT_DELETE_RECEIVED,
  payload: {
    project,
  },
});
