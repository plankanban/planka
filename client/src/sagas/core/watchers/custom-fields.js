/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* customFieldsWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_IN_BASE_GROUP_CREATE,
      ({ payload: { baseCustomFieldGroupId, data } }) =>
        services.createCustomFieldInBaseGroup(baseCustomFieldGroupId, data),
    ),
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_IN_GROUP_CREATE,
      ({ payload: { customFieldGroupId, data } }) =>
        services.createCustomFieldInGroup(customFieldGroupId, data),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_CREATE_HANDLE, ({ payload: { customField } }) =>
      services.handleCustomFieldCreate(customField),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_UPDATE, ({ payload: { id, data } }) =>
      services.updateCustomField(id, data),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_UPDATE_HANDLE, ({ payload: { customField } }) =>
      services.handleCustomFieldUpdate(customField),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_MOVE, ({ payload: { id, index } }) =>
      services.moveCustomField(id, index),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_DELETE, ({ payload: { id } }) =>
      services.deleteCustomField(id),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_DELETE_HANDLE, ({ payload: { customField } }) =>
      services.handleCustomFieldDelete(customField),
    ),
  ]);
}
