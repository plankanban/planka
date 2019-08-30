import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const deleteNotifications = (ids) => ({
  type: ActionTypes.NOTIFICATIONS_DELETE,
  payload: {
    ids,
  },
});

/* Events */

export const fetchNotificationsRequested = () => ({
  type: ActionTypes.NOTIFICATIONS_FETCH_REQUESTED,
  payload: {},
});

export const fetchNotificationsSucceeded = (notifications, users, cards, actions) => ({
  type: ActionTypes.NOTIFICATIONS_FETCH_SUCCEEDED,
  payload: {
    notifications,
    users,
    cards,
    actions,
  },
});

export const fetchNotificationsFailed = (error) => ({
  type: ActionTypes.NOTIFICATIONS_FETCH_FAILED,
  payload: {
    error,
  },
});

export const deleteNotificationsRequested = (ids) => ({
  type: ActionTypes.NOTIFICATIONS_DELETE_REQUESTED,
  payload: {
    ids,
  },
});

export const deleteNotificationsSucceeded = (notifications) => ({
  type: ActionTypes.NOTIFICATIONS_DELETE_SUCCEEDED,
  payload: {
    notifications,
  },
});

export const deleteNotificationsFailed = (ids, error) => ({
  type: ActionTypes.NOTIFICATIONS_DELETE_FAILED,
  payload: {
    ids,
    error,
  },
});
