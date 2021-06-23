import ActionTypes from '../constants/ActionTypes';

export const authenticate = (data) => ({
  type: ActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

authenticate.success = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticate.failure = (error) => ({
  type: ActionTypes.AUTHENTICATE__FAILURE,
  payload: {
    error,
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
