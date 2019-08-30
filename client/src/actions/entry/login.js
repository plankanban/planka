import EntryActionTypes from '../../constants/EntryActionTypes';

export const authenticate = (data) => ({
  type: EntryActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

export const clearAuthenticationError = () => ({
  type: EntryActionTypes.AUTHENTICATION_ERROR_CLEAR,
  payload: {},
});

export const logout = () => ({
  type: EntryActionTypes.LOGOUT,
  payload: {},
});
