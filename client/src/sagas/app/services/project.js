import { call, put, select } from 'redux-saga/effects';

import { goToProjectService, goToRootService } from './router';
import {
  createProjectRequest,
  deleteProjectRequest,
  updateProjectBackgroundImageRequest,
  updateProjectRequest,
} from '../requests';
import { pathSelector } from '../../../selectors';
import { createProject, deleteProject, updateProject } from '../../../actions';

export function* createProjectService(data) {
  yield put(createProject(data));

  const {
    success,
    payload: { project },
  } = yield call(createProjectRequest, data);

  if (success) {
    yield call(goToProjectService, project.id);
  }
}

export function* updateProjectService(id, data) {
  yield put(updateProject(id, data));
  yield call(updateProjectRequest, id, data);
}

export function* updateCurrentProjectService(data) {
  const { projectId } = yield select(pathSelector);

  yield call(updateProjectService, projectId, data);
}

export function* updateProjectBackgroundImageService(id, data) {
  yield call(updateProjectBackgroundImageRequest, id, data);
}

export function* updateCurrentProjectBackgroundImageService(data) {
  const { projectId } = yield select(pathSelector);

  yield call(updateProjectBackgroundImageService, projectId, data);
}

export function* deleteProjectService(id) {
  const { projectId } = yield select(pathSelector);

  if (id === projectId) {
    yield call(goToRootService);
  }

  yield put(deleteProject(id));
  yield call(deleteProjectRequest, id);
}

export function* deleteCurrentProjectService() {
  const { projectId } = yield select(pathSelector);

  yield call(deleteProjectService, projectId);
}
