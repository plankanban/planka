import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';

export function* handleNotificationCreate(notification) {
  const { cardId } = yield select(selectors.selectPath);

  if (notification.cardId === cardId) {
    try {
      yield call(request, api.updateNotifications, [notification.id], {
        isRead: true,
      });
    } catch {} // eslint-disable-line no-empty
  } else {
    let users;
    let cards;
    let activities;

    try {
      ({
        included: { users, cards, activities },
      } = yield call(request, api.getNotification, notification.id));
    } catch {
      return;
    }

    yield put(actions.handleNotificationCreate(notification, users, cards, activities));
  }
}

export function* deleteNotification(id) {
  yield put(actions.deleteNotification(id));

  let notifications;
  try {
    ({ items: notifications } = yield call(request, api.updateNotifications, [id], {
      isRead: true,
    }));
  } catch (error) {
    yield put(actions.deleteNotification.failure(id, error));
    return;
  }

  yield put(actions.deleteNotification.success(notifications[0]));
}

export function* handleNotificationDelete(notification) {
  yield put(actions.handleNotificationDelete(notification));
}

export default {
  handleNotificationCreate,
  deleteNotification,
  handleNotificationDelete,
};
