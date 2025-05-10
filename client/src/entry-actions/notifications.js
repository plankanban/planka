/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const deleteAllNotifications = () => ({
  type: EntryActionTypes.ALL_NOTIFICATIONS_DELETE,
  payload: {},
});

const handleNotificationCreate = (notification, users) => ({
  type: EntryActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
    users,
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
  deleteAllNotifications,
  handleNotificationCreate,
  deleteNotification,
  handleNotificationDelete,
};
