import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* notificationsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.NOTIFICATION_CREATE_HANDLE, ({ payload: { notification } }) =>
      services.handleNotificationCreate(notification),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE, ({ payload: { id } }) =>
      services.deleteNotification(id),
    ),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE_HANDLE, ({ payload: { notification } }) =>
      services.handleNotificationDelete(notification),
    ),
  ]);
}
