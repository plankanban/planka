import ActionTypes from '../constants/ActionTypes';

/* Events */

export const fetchUsersRequested = () => ({
  type: ActionTypes.USERS_FETCH_REQUESTED,
  payload: {},
});

export const fetchUsersSucceeded = (users) => ({
  type: ActionTypes.USERS_FETCH_SUCCEEDED,
  payload: {
    users,
  },
});

export const fetchUsersFailed = (error) => ({
  type: ActionTypes.USERS_FETCH_FAILED,
  payload: {
    error,
  },
});
