import EntryActionTypes from '../constants/EntryActionTypes';

const logout = () => ({
  type: EntryActionTypes.LOGOUT,
  payload: {},
});

export default {
  logout,
};
