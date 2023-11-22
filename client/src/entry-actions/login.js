import EntryActionTypes from '../constants/EntryActionTypes';

const authenticate = (data) => ({
  type: EntryActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

const clearAuthenticateError = () => ({
  type: EntryActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export default {
  authenticate,
  clearAuthenticateError,
};
