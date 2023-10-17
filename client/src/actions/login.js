import ActionTypes from '../constants/ActionTypes';

const initializeLogin = (config) => ({
  type: ActionTypes.LOGIN_INITIALIZE,
  payload: {
    config,
  },
});

const authenticate = (data) => ({
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

const authenticateWithOidc = () => ({
  type: ActionTypes.WITH_OIDC_AUTHENTICATE,
  payload: {},
});

authenticateWithOidc.success = (accessToken) => ({
  type: ActionTypes.WITH_OIDC_AUTHENTICATE__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticateWithOidc.failure = (error) => ({
  type: ActionTypes.WITH_OIDC_AUTHENTICATE__FAILURE,
  payload: {
    error,
  },
});

const clearAuthenticateError = () => ({
  type: ActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export default {
  initializeLogin,
  authenticate,
  authenticateWithOidc,
  clearAuthenticateError,
};
