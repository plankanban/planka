/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { buildCustomFieldValueId } from '../../../models/CustomFieldValue';
import { createLocalId } from '../../../utils/local-id';

export function* updateCustomFieldValue(cardId, customFieldGroupId, customFieldId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.updateCustomFieldValue({
      ...data,
      cardId,
      customFieldGroupId,
      customFieldId,
    }),
  );

  let customFieldValue;
  try {
    ({ item: customFieldValue } = yield call(
      request,
      api.updateCustomFieldValue,
      cardId,
      customFieldGroupId,
      customFieldId,
      data,
    ));
  } catch (error) {
    yield put(actions.updateCustomFieldValue.failure(localId, error));
    return;
  }

  yield put(actions.updateCustomFieldValue.success(localId, customFieldValue));
}

export function* handleCustomFieldValueUpdate(customFieldValue) {
  yield put(actions.handleCustomFieldValueUpdate(customFieldValue));
}

export function* deleteCustomFieldValue(cardId, customFieldGroupId, customFieldId) {
  const id = buildCustomFieldValueId({
    cardId,
    customFieldGroupId,
    customFieldId,
  });

  yield put(actions.deleteCustomFieldValue(id));

  let customFieldValue;
  try {
    ({ item: customFieldValue } = yield call(
      request,
      api.deleteCustomFieldValue,
      cardId,
      customFieldGroupId,
      customFieldId,
    ));
  } catch (error) {
    yield put(actions.deleteCustomFieldValue.failure(id, error));
    return;
  }

  yield put(actions.deleteCustomFieldValue.success(customFieldValue));
}

export function* handleCustomFieldValueDelete(customFieldValue) {
  yield put(actions.handleCustomFieldValueDelete(customFieldValue));
}

export default {
  updateCustomFieldValue,
  handleCustomFieldValueUpdate,
  deleteCustomFieldValue,
  handleCustomFieldValueDelete,
};
