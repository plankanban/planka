import EntryActionTypes from '../constants/EntryActionTypes';

const logout = (invalidateAccessToken) => ({
  type: EntryActionTypes.LOGOUT,
  payload: {
    invalidateAccessToken,
  },
});

export default {
  logout,
};
