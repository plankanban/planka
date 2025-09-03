/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createWebhook(data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createWebhook({
      ...data,
      id: localId,
    }),
  );

  let webhook;
  try {
    ({ item: webhook } = yield call(request, api.createWebhook, {
      ...data,
      events: data.events && data.events.join(','),
      excludedEvents: data.excludedEvents && data.excludedEvents.join(','),
    }));
  } catch (error) {
    yield put(actions.createWebhook.failure(localId, error));
    return;
  }

  yield put(actions.createWebhook.success(localId, webhook));
}

export function* handleWebhookCreate(webhook) {
  yield put(actions.handleWebhookCreate(webhook));
}

export function* updateWebhook(id, data) {
  yield put(actions.updateWebhook(id, data));

  let webhook;
  try {
    ({ item: webhook } = yield call(request, api.updateWebhook, id, {
      ...data,
      events: data.events && data.events.join(','),
      excludedEvents: data.excludedEvents && data.excludedEvents.join(','),
    }));
  } catch (error) {
    yield put(actions.updateWebhook.failure(id, error));
    return;
  }

  yield put(actions.updateWebhook.success(webhook));
}

export function* handleWebhookUpdate(webhook) {
  yield put(actions.handleWebhookUpdate(webhook));
}

export function* deleteWebhook(id) {
  yield put(actions.deleteWebhook(id));

  let webhook;
  try {
    ({ item: webhook } = yield call(request, api.deleteWebhook, id));
  } catch (error) {
    yield put(actions.deleteWebhook.failure(id, error));
    return;
  }

  yield put(actions.deleteWebhook.success(webhook));
}

export function* handleWebhookDelete(webhook) {
  yield put(actions.handleWebhookDelete(webhook));
}

export default {
  createWebhook,
  handleWebhookCreate,
  updateWebhook,
  handleWebhookUpdate,
  deleteWebhook,
  handleWebhookDelete,
};
