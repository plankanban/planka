import ActionTypes from '../constants/ActionTypes';

/* Events */

export const fetchProjectsRequested = () => ({
  type: ActionTypes.PROJECTS_FETCH_REQUESTED,
  payload: {},
});

export const fetchProjectsSucceeded = (projects, users, projectMemberships, boards) => ({
  type: ActionTypes.PROJECTS_FETCH_SUCCEEDED,
  payload: {
    projects,
    users,
    projectMemberships,
    boards,
  },
});

export const fetchProjectsFailed = error => ({
  type: ActionTypes.PROJECTS_FETCH_FAILED,
  payload: {
    error,
  },
});
