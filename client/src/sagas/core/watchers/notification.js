import { takeLatest } from 'redux-saga/effects';

import { deleteNotificationService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* notificationWatchers() {
  yield takeLatest(EntryActionTypes.NOTIFICATION_DELETE, ({ payload: { id } }) =>
    deleteNotificationService(id),
  );
}
