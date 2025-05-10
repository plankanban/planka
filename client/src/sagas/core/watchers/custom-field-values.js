/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* customFieldValuessWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_VALUE_UPDATE,
      ({ payload: { cardId, customFieldGroupId, customFieldId, data } }) =>
        services.updateCustomFieldValue(cardId, customFieldGroupId, customFieldId, data),
    ),
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_VALUE_UPDATE_HANDLE,
      ({ payload: { customFieldValue } }) =>
        services.handleCustomFieldValueUpdate(customFieldValue),
    ),
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_VALUE_DELETE,
      ({ payload: { cardId, customFieldGroupId, customFieldId } }) =>
        services.deleteCustomFieldValue(cardId, customFieldGroupId, customFieldId),
    ),
    takeEvery(
      EntryActionTypes.CUSTOM_FIELD_VALUE_DELETE_HANDLE,
      ({ payload: { customFieldValue } }) =>
        services.handleCustomFieldValueDelete(customFieldValue),
    ),
  ]);
}
