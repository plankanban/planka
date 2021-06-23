import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { pathSelector } from '../../../selectors';
import {
  deleteNotification,
  handleNotificationCreate,
  handleNotificationDelete,
} from '../../../actions';
import api from '../../../api';

export function* handleNotificationCreateService(notification) {
  const { cardId } = yield select(pathSelector);

  if (notification.cardId === cardId) {
    try {
      yield call(request, api.updateNotifications, [notification.id], {
        isRead: true,
      });
    } catch {} // eslint-disable-line no-empty
  } else {
    let users;
    let cards;
    let actions;

    try {
      ({
        included: { users, cards, actions },
      } = yield call(request, api.getNotification, notification.id));
    } catch {
      return;
    }

    yield put(handleNotificationCreate(notification, users, cards, actions));
  }
}

export function* deleteNotificationService(id) {
  yield put(deleteNotification(id));

  let notifications;
  try {
    ({ items: notifications } = yield call(request, api.updateNotifications, [id], {
      isRead: true,
    }));
  } catch (error) {
    yield put(deleteNotification.failure(id, error));
    return;
  }

  yield put(deleteNotification.success(notifications[0]));
}

export function* handleNotificationDeleteService(notification) {
  yield put(handleNotificationDelete(notification));
}
