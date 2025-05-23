/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';

export function* deleteAllNotifications() {
  yield put(actions.deleteAllNotifications());

  let notifications;
  try {
    ({ items: notifications } = yield call(request, api.readAllNotifications));
  } catch (error) {
    yield put(actions.deleteAllNotifications.failure(error));
    return;
  }

  yield put(actions.deleteAllNotifications.success(notifications));
}

export function* handleNotificationCreate(notification, users) {
  const { cardId } = yield select(selectors.selectPath);

  if (notification.cardId === cardId) {
    try {
      yield call(request, api.updateNotification, notification.id, {
        isRead: true,
      });
    } catch {
      /* empty */
    }
  } else {
    yield put(actions.handleNotificationCreate(notification, users));
  }
}

export function* deleteNotification(id) {
  yield put(actions.deleteNotification(id));

  let notification;
  try {
    ({ item: notification } = yield call(request, api.updateNotification, id, {
      isRead: true,
    }));
  } catch (error) {
    yield put(actions.deleteNotification.failure(id, error));
    return;
  }

  yield put(actions.deleteNotification.success(notification));
}

export function* handleNotificationDelete(notification) {
  yield put(actions.handleNotificationDelete(notification));
}

export default {
  deleteAllNotifications,
  handleNotificationCreate,
  deleteNotification,
  handleNotificationDelete,
};
