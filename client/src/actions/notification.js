import ActionTypes from '../constants/ActionTypes';

export const handleNotificationCreate = (notification, users, cards, actions) => ({
  type: ActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
    users,
    cards,
    actions,
  },
});

export const deleteNotification = (id) => ({
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

export const handleNotificationDelete = (notification) => ({
  type: ActionTypes.NOTIFICATION_DELETE_HANDLE,
  payload: {
    notification,
  },
});
