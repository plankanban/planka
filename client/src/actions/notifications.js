import ActionTypes from '../constants/ActionTypes';

const handleNotificationCreate = (notification, users, cards, activities) => ({
  type: ActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
    users,
    cards,
    activities,
  },
});

const deleteNotification = (id) => ({
  type: ActionTypes.NOTIFICATION_DELETE,
  payload: {
    id,
  },
});

deleteNotification.success = (notification) => ({
  type: ActionTypes.NOTIFICATION_DELETE__SUCCESS,
  payload: {
    notification,
  },
});

deleteNotification.failure = (id, error) => ({
  type: ActionTypes.NOTIFICATION_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleNotificationDelete = (notification) => ({
  type: ActionTypes.NOTIFICATION_DELETE_HANDLE,
  payload: {
    notification,
  },
});

export default {
  handleNotificationCreate,
  deleteNotification,
  handleNotificationDelete,
};
