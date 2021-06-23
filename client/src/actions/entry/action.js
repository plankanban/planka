import EntryActionTypes from '../../constants/EntryActionTypes';

export const handleActionCreate = (action) => ({
  type: EntryActionTypes.ACTION_CREATE_HANDLE,
  payload: {
    action,
  },
});

export const handleActionUpdate = (action) => ({
  type: EntryActionTypes.ACTION_UPDATE_HANDLE,
  payload: {
    action,
  },
});

export const handleActionDelete = (action) => ({
  type: EntryActionTypes.ACTION_DELETE_HANDLE,
  payload: {
    action,
  },
});
