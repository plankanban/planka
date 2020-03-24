import ActionTypes from '../constants/ActionTypes';

/* Events */

export const fetchActionsRequested = (cardId) => ({
  type: ActionTypes.ACTIONS_FETCH_REQUESTED,
  payload: {
    cardId,
  },
});

export const fetchActionsSucceeded = (cardId, actions, users) => ({
  type: ActionTypes.ACTIONS_FETCH_SUCCEEDED,
  payload: {
    cardId,
    actions,
    users,
  },
});

export const fetchActionsFailed = (cardId, error) => ({
  type: ActionTypes.ACTIONS_FETCH_FAILED,
  payload: {
    cardId,
    error,
  },
});
