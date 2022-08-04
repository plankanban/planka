import EntryActionTypes from '../constants/EntryActionTypes';

const initializeCore = () => ({
  type: EntryActionTypes.CORE_INITIALIZE,
  payload: {},
});

const logout = () => ({
  type: EntryActionTypes.LOGOUT,
  payload: {},
});

export default {
  initializeCore,
  logout,
};
