import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createProjectMembership = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE,
  payload: {
    projectMembership,
  },
});

export const deleteProjectMembership = (id) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createProjectMembershipRequested = (localId, data) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createProjectMembershipSucceeded = (localId, projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE_SUCCEEDED,
  payload: {
    localId,
    projectMembership,
  },
});

export const createProjectMembershipFailed = (localId, error) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const createProjectMembershipReceived = (projectMembership, user) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE_RECEIVED,
  payload: {
    projectMembership,
    user,
  },
});

export const deleteProjectMembershipRequested = (id) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteProjectMembershipSucceeded = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE_SUCCEEDED,
  payload: {
    projectMembership,
  },
});

export const deleteProjectMembershipFailed = (id, error) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteProjectMembershipReceived = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE_RECEIVED,
  payload: {
    projectMembership,
  },
});
