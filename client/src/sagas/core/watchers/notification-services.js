/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* notificationServicesWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.NOTIFICATION_SERVICE_IN_CURRENT_USER_CREATE,
      ({ payload: { data } }) => services.createNotificationServiceInCurrentUser(data),
    ),
    takeEvery(
      EntryActionTypes.NOTIFICATION_SERVICE_IN_BOARD_CREATE,
      ({ payload: { boardId, data } }) => services.createNotificationServiceInBoard(boardId, data),
    ),
    takeEvery(
      EntryActionTypes.NOTIFICATION_SERVICE_CREATE_HANDLE,
      ({ payload: { notificationService } }) =>
        services.handleNotificationServiceCreate(notificationService),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_SERVICE_UPDATE, ({ payload: { id, data } }) =>
      services.updateNotificationService(id, data),
    ),
    takeEvery(
      EntryActionTypes.NOTIFICATION_SERVICE_UPDATE_HANDLE,
      ({ payload: { notificationService } }) =>
        services.handleNotificationServiceUpdate(notificationService),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_SERVICE_TEST, ({ payload: { id } }) =>
      services.testNotificationService(id),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_SERVICE_DELETE, ({ payload: { id } }) =>
      services.deleteNotificationService(id),
    ),
    takeEvery(
      EntryActionTypes.NOTIFICATION_SERVICE_DELETE_HANDLE,
      ({ payload: { notificationService } }) =>
        services.handleNotificationServiceDelete(notificationService),
    ),
  ]);
}
