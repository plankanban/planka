import ActionTypes from '../constants/ActionTypes';

// eslint-disable-next-line import/prefer-default-export
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
