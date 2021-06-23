import EntryActionTypes from '../../constants/EntryActionTypes';

// eslint-disable-next-line import/prefer-default-export
export const initializeCore = () => ({
  type: EntryActionTypes.CORE_INITIALIZE,
  payload: {},
});
