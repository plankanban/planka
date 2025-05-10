/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createCustomFieldInBaseGroup(baseCustomFieldGroupId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(
      selectors.selectNextCustomFieldPositionInBaseGroup,
      baseCustomFieldGroupId,
    ),
  };

  yield put(
    actions.createCustomField({
      ...nextData,
      baseCustomFieldGroupId,
      id: localId,
    }),
  );

  let customField;
  try {
    ({ item: customField } = yield call(
      request,
      api.createCustomFieldInBaseGroup,
      baseCustomFieldGroupId,
      nextData,
    ));
  } catch (error) {
    yield put(actions.createCustomField.failure(localId, error));
    return;
  }

  yield put(actions.createCustomField.success(localId, customField));
}

export function* createCustomFieldInGroup(customFieldGroupId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextCustomFieldPositionInGroup, customFieldGroupId),
  };

  yield put(
    actions.createCustomField({
      ...nextData,
      customFieldGroupId,
      id: localId,
    }),
  );

  let customField;
  try {
    ({ item: customField } = yield call(
      request,
      api.createCustomFieldInGroup,
      customFieldGroupId,
      nextData,
    ));
  } catch (error) {
    yield put(actions.createCustomField.failure(localId, error));
    return;
  }

  yield put(actions.createCustomField.success(localId, customField));
}

export function* handleCustomFieldCreate(customField) {
  yield put(actions.handleCustomFieldCreate(customField));
}

export function* updateCustomField(id, data) {
  yield put(actions.updateCustomField(id, data));

  let customField;
  try {
    ({ item: customField } = yield call(request, api.updateCustomField, id, data));
  } catch (error) {
    yield put(actions.updateCustomField.failure(id, error));
    return;
  }

  yield put(actions.updateCustomField.success(customField));
}

export function* handleCustomFieldUpdate(customField) {
  yield put(actions.handleCustomFieldUpdate(customField));
}

export function* moveCustomField(id, index) {
  const customField = yield select(selectors.selectCustomFieldById, id);

  let position;
  if (customField.baseCustomFieldGroupId) {
    position = yield select(
      selectors.selectNextCustomFieldPositionInBaseGroup,
      customField.baseCustomFieldGroupId,
      index,
      id,
    );
  } else if (customField.customFieldGroupId) {
    position = yield select(
      selectors.selectNextCustomFieldPositionInGroup,
      customField.customFieldGroupId,
      index,
      id,
    );
  }

  yield call(updateCustomField, id, {
    position,
  });
}

export function* deleteCustomField(id) {
  yield put(actions.deleteCustomField(id));

  let customField;
  try {
    ({ item: customField } = yield call(request, api.deleteCustomField, id));
  } catch (error) {
    yield put(actions.deleteCustomField.failure(id, error));
    return;
  }

  yield put(actions.deleteCustomField.success(customField));
}

export function* handleCustomFieldDelete(customField) {
  yield put(actions.handleCustomFieldDelete(customField));
}

export default {
  createCustomFieldInBaseGroup,
  createCustomFieldInGroup,
  handleCustomFieldCreate,
  updateCustomField,
  handleCustomFieldUpdate,
  moveCustomField,
  deleteCustomField,
  handleCustomFieldDelete,
};
