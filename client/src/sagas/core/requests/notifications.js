import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  deleteNotificationsFailed,
  deleteNotificationsRequested,
  deleteNotificationsSucceeded,
  fetchNotificationsFailed,
  fetchNotificationsRequested,
  fetchNotificationsSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* fetchNotificationsRequest() {
  yield put(fetchNotificationsRequested());

  try {
    const {
      items,
      included: { users, cards, actions },
    } = yield call(request, api.getNotifications);

    const action = fetchNotificationsSucceeded(items, users, cards, actions);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = fetchNotificationsFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteNotificationsRequest(ids) {
  yield put(deleteNotificationsRequested(ids));

  try {
    const { items } = yield call(request, api.updateNotifications, ids, {
      isRead: true,
    });

    const action = deleteNotificationsSucceeded(items);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteNotificationsFailed(ids, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
