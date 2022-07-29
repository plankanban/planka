import EntryActionTypes from '../../constants/EntryActionTypes';

export const fetchActionsInCurrentCard = () => ({
  type: EntryActionTypes.ACTIONS_IN_CURRENT_CARD_FETCH,
  payload: {},
});

export const toggleActionsDetailsInCurrentCard = (isVisible) => ({
  type: EntryActionTypes.ACTIONS_DETAILS_IN_CURRENT_CARD_TOGGLE,
  payload: {
    isVisible,
  },
});
