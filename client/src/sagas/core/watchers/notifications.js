/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* notificationsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ALL_NOTIFICATIONS_DELETE, () => services.deleteAllNotifications()),
    takeEvery(EntryActionTypes.NOTIFICATION_CREATE_HANDLE, ({ payload: { notification, users } }) =>
      services.handleNotificationCreate(notification, users),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE, ({ payload: { id } }) =>
      services.deleteNotification(id),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE_HANDLE, ({ payload: { notification } }) =>
      services.handleNotificationDelete(notification),
    ),
  ]);
}
