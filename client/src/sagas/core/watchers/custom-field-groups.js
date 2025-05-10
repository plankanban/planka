/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* customFieldGroupsWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_GROUP_IN_CURRENT_BOARD_CREATE,
      ({ payload: { data } }) => services.createCustomFieldGroupInCurrentBoard(data),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_GROUP_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      services.createCustomFieldGroupInCurrentCard(data),
    ),
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_GROUP_CREATE_HANDLE,
      ({ payload: { customFieldGroup } }) =>
        services.handleCustomFieldGroupCreate(customFieldGroup),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_GROUP_UPDATE, ({ payload: { id, data } }) =>
      services.updateCustomFieldGroup(id, data),
    ),
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_GROUP_UPDATE_HANDLE,
      ({ payload: { customFieldGroup } }) =>
        services.handleCustomFieldGroupUpdate(customFieldGroup),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_GROUP_MOVE, ({ payload: { id, index } }) =>
      services.moveCustomFieldGroup(id, index),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FIELD_GROUP_DELETE, ({ payload: { id } }) =>
      services.deleteCustomFieldGroup(id),
    ),
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_GROUP_DELETE_HANDLE,
      ({ payload: { customFieldGroup } }) =>
        services.handleCustomFieldGroupDelete(customFieldGroup),
    ),
  ]);
}
