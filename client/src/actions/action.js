import ActionTypes from '../constants/ActionTypes';

/* Events */

export const createActionReceived = (action) => ({
  type: ActionTypes.ACTION_CREATE_RECEIVED,
  payload: {
    action,
  },
});

export const updateActionReceived = (action) => ({
  type: ActionTypes.ACTION_UPDATE_RECEIVED,
  payload: {
    action,
  },
});

export const deleteActionReceived = (action) => ({
  type: ActionTypes.ACTION_DELETE_RECEIVED,
  payload: {
    action,
  },
});
