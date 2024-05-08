import EntryActionTypes from '../constants/EntryActionTypes';

const authenticate = (data) => ({
  type: EntryActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

const authenticateUsingOidc = () => ({
  type: EntryActionTypes.USING_OIDC_AUTHENTICATE,
  payload: {},
});

const clearAuthenticateError = () => ({
  type: EntryActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export default {
  authenticate,
  authenticateUsingOidc,
  clearAuthenticateError,
};
