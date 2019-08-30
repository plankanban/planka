import { call } from 'redux-saga/effects';

import { deleteNotificationsService } from './notifications';

// eslint-disable-next-line import/prefer-default-export
export function* deleteNotificationService(id) {
  yield call(deleteNotificationsService, [id]);
}
