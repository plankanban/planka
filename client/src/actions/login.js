import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const authenticate = (data) => ({
  type: ActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

export const clearAuthenticateError = () => ({
  type: ActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export const logout = () => ({
  type: ActionTypes.LOGOUT,
  payload: {},
});

/* Events */

export const authenticateRequested = (data) => ({
  type: ActionTypes.AUTHENTICATE_REQUESTED,
  payload: {
    data,
  },
});

export const authenticateSucceeded = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE_SUCCEEDED,
  payload: {
    accessToken,
  },
});

export const authenticateFailed = (error) => ({
  type: ActionTypes.AUTHENTICATE_FAILED,
  payload: {
    error,
  },
});
