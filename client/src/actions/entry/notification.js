import EntryActionTypes from '../../constants/EntryActionTypes';

export const handleNotificationCreate = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
  },
});

export const deleteNotification = (id) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE,
  payload: {
    id,
  },
});

export const handleNotificationDelete = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE_HANDLE,
  payload: {
    notification,
  },
});
