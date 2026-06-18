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

export function* createProjectLabel(projectId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextProjectLabelPosition, projectId),
  };

  yield put(
    actions.createProjectLabel({
      ...nextData,
      projectId,
      id: localId,
    }),
  );

  let projectLabel;
  try {
    ({ item: projectLabel } = yield call(request, api.createProjectLabel, projectId, nextData));
  } catch (error) {
    yield put(actions.createProjectLabel.failure(localId, error));
    return;
  }

  yield put(actions.createProjectLabel.success(localId, projectLabel));
}

export function* createProjectLabelInCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(createProjectLabel, projectId, data);
}

export function* handleProjectLabelCreate(projectLabel) {
  yield put(actions.handleProjectLabelCreate(projectLabel));
}

export function* updateProjectLabel(id, data) {
  yield put(actions.updateProjectLabel(id, data));

  let projectLabel;
  try {
    ({ item: projectLabel } = yield call(request, api.updateProjectLabel, id, data));
  } catch (error) {
    yield put(actions.updateProjectLabel.failure(id, error));
    return;
  }

  yield put(actions.updateProjectLabel.success(projectLabel));
}

export function* handleProjectLabelUpdate(projectLabel) {
  yield put(actions.handleProjectLabelUpdate(projectLabel));
}

export function* moveProjectLabel(id, index) {
  const { projectId } = yield select(selectors.selectProjectLabelById, id);
  const position = yield select(selectors.selectNextProjectLabelPosition, projectId, index, id);

  yield call(updateProjectLabel, id, {
    position,
  });
}

export function* deleteProjectLabel(id) {
  yield put(actions.deleteProjectLabel(id));

  let projectLabel;
  try {
    ({ item: projectLabel } = yield call(request, api.deleteProjectLabel, id));
  } catch (error) {
    yield put(actions.deleteProjectLabel.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectLabel.success(projectLabel));
}

export function* handleProjectLabelDelete(projectLabel) {
  yield put(actions.handleProjectLabelDelete(projectLabel));
}

export default {
  createProjectLabel,
  createProjectLabelInCurrentProject,
  handleProjectLabelCreate,
  updateProjectLabel,
  handleProjectLabelUpdate,
  moveProjectLabel,
  deleteProjectLabel,
  handleProjectLabelDelete,
};
