import ActionTypes from '../constants/ActionTypes';

/* Events */

export const createNotificationReceived = (notification, user, card, action) => ({
  type: ActionTypes.NOTIFICATION_CREATE_RECEIVED,
  payload: {
    notification,
    user,
    card,
    action,
  },
});

export const deleteNotificationReceived = (notification) => ({
  type: ActionTypes.NOTIFICATION_DELETE_RECEIVED,
  payload: {
    notification,
  },
});
