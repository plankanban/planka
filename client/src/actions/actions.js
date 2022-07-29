import ActionTypes from '../constants/ActionTypes';

export const fetchActions = (cardId) => ({
  type: ActionTypes.ACTIONS_FETCH,
  payload: {
    cardId,
  },
});

fetchActions.success = (cardId, actions, users) => ({
  type: ActionTypes.ACTIONS_FETCH__SUCCESS,
  payload: {
    cardId,
    actions,
    users,
  },
});

fetchActions.failure = (cardId, error) => ({
  type: ActionTypes.ACTIONS_FETCH__FAILURE,
  payload: {
    cardId,
    error,
  },
});

export const toggleActionsDetails = (cardId, isVisible) => ({
  type: ActionTypes.ACTIONS_DETAILS_TOGGLE,
  payload: {
    cardId,
    isVisible,
  },
});

toggleActionsDetails.success = (cardId, actions, users) => ({
  type: ActionTypes.ACTIONS_DETAILS_TOGGLE__SUCCESS,
  payload: {
    cardId,
    actions,
    users,
  },
});

toggleActionsDetails.failure = (cardId, error) => ({
  type: ActionTypes.ACTIONS_DETAILS_TOGGLE__FAILURE,
  payload: {
    cardId,
    error,
  },
});
