/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const deleteAllNotifications = () => ({
  type: ActionTypes.ALL_NOTIFICATIONS_DELETE,
  payload: {},
});

deleteAllNotifications.success = (notifications) => ({
  type: ActionTypes.ALL_NOTIFICATIONS_DELETE__SUCCESS,
  payload: {
    notifications,
  },
});

deleteAllNotifications.failure = (error) => ({
  type: ActionTypes.ALL_NOTIFICATIONS_DELETE__FAILURE,
  payload: {
    error,
  },
});

const handleNotificationCreate = (notification, users) => ({
  type: ActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
    users,
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
  deleteAllNotifications,
  handleNotificationCreate,
  deleteNotification,
  handleNotificationDelete,
};
