import { all, takeEvery } from 'redux-saga/effects';

import {
  deleteNotificationService,
  handleNotificationCreateService,
  handleNotificationDeleteService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* notificationWatchers() {
  yield all([
    takeEvery(EntryActionTypes.NOTIFICATION_CREATE_HANDLE, ({ payload: { notification } }) =>
      handleNotificationCreateService(notification),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE, ({ payload: { id } }) =>
      deleteNotificationService(id),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE_HANDLE, ({ payload: { notification } }) =>
      handleNotificationDeleteService(notification),
    ),
  ]);
}
