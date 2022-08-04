import EntryActionTypes from '../constants/EntryActionTypes';

const handleNotificationCreate = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
  },
});

const deleteNotification = (id) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE,
  payload: {
    id,
  },
});

const handleNotificationDelete = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE_HANDLE,
  payload: {
    notification,
  },
});

export default {
  handleNotificationCreate,
  deleteNotification,
  handleNotificationDelete,
};
