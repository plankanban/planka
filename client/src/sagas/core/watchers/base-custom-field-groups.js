/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* baseCustomFieldGroupsWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_IN_CURRENT_PROJECT_CREATE,
      ({ payload: { data } }) => services.createBaseCustomFieldGroupInCurrentProject(data),
    ),
    takeEvery(
      EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE_HANDLE,
      ({ payload: { baseCustomFieldGroup } }) =>
        services.handleBaseCustomFieldGroupCreate(baseCustomFieldGroup),
    ),
    takeEvery(EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE, ({ payload: { id, data } }) =>
      services.updateBaseCustomFieldGroup(id, data),
    ),
    takeEvery(
      EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE_HANDLE,
      ({ payload: { baseCustomFieldGroup } }) =>
        services.handleBaseCustomFieldGroupUpdate(baseCustomFieldGroup),
    ),
    takeEvery(EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE, ({ payload: { id } }) =>
      services.deleteBaseCustomFieldGroup(id),
    ),
    takeEvery(
      EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE_HANDLE,
      ({ payload: { baseCustomFieldGroup } }) =>
        services.handleBaseCustomFieldGroupDelete(baseCustomFieldGroup),
    ),
  ]);
}
