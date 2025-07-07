/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* webhooksWatchers() {
  yield all([
    takeEvery(EntryActionTypes.WEBHOOK_CREATE, ({ payload: { data } }) =>
      services.createWebhook(data),
    ),
    takeEvery(EntryActionTypes.WEBHOOK_CREATE_HANDLE, ({ payload: { webhook } }) =>
      services.handleWebhookCreate(webhook),
    ),
    takeEvery(EntryActionTypes.WEBHOOK_UPDATE, ({ payload: { id, data } }) =>
      services.updateWebhook(id, data),
    ),
    takeEvery(EntryActionTypes.WEBHOOK_UPDATE_HANDLE, ({ payload: { webhook } }) =>
      services.handleWebhookUpdate(webhook),
    ),
    takeEvery(EntryActionTypes.WEBHOOK_DELETE, ({ payload: { id } }) => services.deleteWebhook(id)),
    takeEvery(EntryActionTypes.WEBHOOK_DELETE_HANDLE, ({ payload: { webhook } }) =>
      services.handleWebhookDelete(webhook),
    ),
  ]);
}
