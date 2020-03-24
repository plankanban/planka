import EntryActionTypes from '../../constants/EntryActionTypes';

export const authenticate = (data) => ({
  type: EntryActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

export const clearAuthenticateError = () => ({
  type: EntryActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export const logout = () => ({
  type: EntryActionTypes.LOGOUT,
  payload: {},
});
