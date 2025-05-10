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

export function* createBaseCustomFieldGroup(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createBaseCustomFieldGroup({
      ...data,
      projectId,
      id: localId,
    }),
  );

  let baseCustomFieldGroup;
  try {
    ({ item: baseCustomFieldGroup } = yield call(
      request,
      api.createBaseCustomFieldGroup,
      projectId,
      data,
    ));
  } catch (error) {
    yield put(actions.createBaseCustomFieldGroup.failure(localId, error));
    return;
  }

  yield put(actions.createBaseCustomFieldGroup.success(localId, baseCustomFieldGroup));
}

export function* createBaseCustomFieldGroupInCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(createBaseCustomFieldGroup, projectId, data);
}

export function* handleBaseCustomFieldGroupCreate(baseCustomFieldGroup) {
  yield put(actions.handleBaseCustomFieldGroupCreate(baseCustomFieldGroup));
}

export function* updateBaseCustomFieldGroup(id, data) {
  yield put(actions.updateBaseCustomFieldGroup(id, data));

  let baseCustomFieldGroup;
  try {
    ({ item: baseCustomFieldGroup } = yield call(
      request,
      api.updateBaseCustomFieldGroup,
      id,
      data,
    ));
  } catch (error) {
    yield put(actions.updateBaseCustomFieldGroup.failure(id, error));
    return;
  }

  yield put(actions.updateBaseCustomFieldGroup.success(baseCustomFieldGroup));
}

export function* handleBaseCustomFieldGroupUpdate(baseCustomFieldGroup) {
  yield put(actions.handleBaseCustomFieldGroupUpdate(baseCustomFieldGroup));
}

export function* deleteBaseCustomFieldGroup(id) {
  yield put(actions.deleteBaseCustomFieldGroup(id));

  let baseCustomFieldGroup;
  try {
    ({ item: baseCustomFieldGroup } = yield call(request, api.deleteBaseCustomFieldGroup, id));
  } catch (error) {
    yield put(actions.deleteBaseCustomFieldGroup.failure(id, error));
    return;
  }

  yield put(actions.deleteBaseCustomFieldGroup.success(baseCustomFieldGroup));
}

export function* handleBaseCustomFieldGroupDelete(baseCustomFieldGroup) {
  yield put(actions.handleBaseCustomFieldGroupDelete(baseCustomFieldGroup));
}

export default {
  createBaseCustomFieldGroup,
  createBaseCustomFieldGroupInCurrentProject,
  handleBaseCustomFieldGroupCreate,
  updateBaseCustomFieldGroup,
  handleBaseCustomFieldGroupUpdate,
  deleteBaseCustomFieldGroup,
  handleBaseCustomFieldGroupDelete,
};
