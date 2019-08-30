import EntryActionTypes from '../../constants/EntryActionTypes';

// eslint-disable-next-line import/prefer-default-export
export const fetchActionsInCurrentCard = () => ({
  type: EntryActionTypes.ACTIONS_IN_CURRENT_CARD_FETCH,
  payload: {},
});
