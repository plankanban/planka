import { call, put, select } from 'redux-saga/effects';

import { deleteNotificationsRequest } from '../requests';
import { notificationIdsForCurrentCardSelector } from '../../../selectors';
import { deleteNotifications } from '../../../actions';

export function* deleteNotificationsService(ids) {
  yield put(deleteNotifications(ids));
  yield call(deleteNotificationsRequest, ids);
}

export function* deleteNotificationsInCurrentCardService() {
  const notificationIds = yield select(notificationIdsForCurrentCardSelector);

  if (notificationIds && notificationIds.length > 0) {
    yield call(deleteNotificationsService, notificationIds);
  }
}
