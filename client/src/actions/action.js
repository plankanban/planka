import ActionTypes from '../constants/ActionTypes';

export const handleActionCreate = (action) => ({
  type: ActionTypes.ACTION_CREATE_HANDLE,
  payload: {
    action,
  },
});

export const handleActionUpdate = (action) => ({
  type: ActionTypes.ACTION_UPDATE_HANDLE,
  payload: {
    action,
  },
});

export const handleActionDelete = (action) => ({
  type: ActionTypes.ACTION_DELETE_HANDLE,
  payload: {
    action,
  },
});
