import { call, put, select } from 'redux-saga/effects';

import { goToProjectService, goToRootService } from './router';
import request from '../request';
import { pathSelector } from '../../../selectors';
import {
  createProject,
  deleteProject,
  handleProjectCreate,
  handleProjectDelete,
  handleProjectUpdate,
  updateProject,
  updateProjectBackgroundImage,
} from '../../../actions';
import api from '../../../api';

export function* createProjectService(data) {
  yield put(createProject(data));

  let project;
  let projectManagers;

  try {
    ({
      item: project,
      included: { projectManagers },
    } = yield call(request, api.createProject, data));
  } catch (error) {
    yield put(createProject.failure(error));
    return;
  }

  yield put(createProject.success(project, projectManagers));
  yield call(goToProjectService, project.id);
}

export function* handleProjectCreateService({ id }) {
  let project;
  let users;
  let projectManagers;
  let boards;
  let boardMemberships;

  try {
    ({
      item: project,
      included: { users, projectManagers, boards, boardMemberships },
    } = yield call(request, api.getProject, id));
  } catch (error) {
    return;
  }

  yield put(handleProjectCreate(project, users, projectManagers, boards, boardMemberships));
}

export function* updateProjectService(id, data) {
  yield put(updateProject(id, data));

  let project;
  try {
    ({ item: project } = yield call(request, api.updateProject, id, data));
  } catch (error) {
    yield put(updateProject.failure(id, error));
  }

  yield put(updateProject.success(project));
}

export function* updateCurrentProjectService(data) {
  const { projectId } = yield select(pathSelector);

  yield call(updateProjectService, projectId, data);
}

export function* handleProjectUpdateService(project) {
  yield put(handleProjectUpdate(project));
}

export function* updateProjectBackgroundImageService(id, data) {
  yield put(updateProjectBackgroundImage(id));

  let project;
  try {
    ({ item: project } = yield call(request, api.updateProjectBackgroundImage, id, data));
  } catch (error) {
    yield put(updateProjectBackgroundImage.failure(id, error));
  }

  yield put(updateProjectBackgroundImage.success(project));
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

  let project;
  try {
    ({ item: project } = yield call(request, api.deleteProject, id));
  } catch (error) {
    yield put(deleteProject.failure(id, error));
  }

  yield put(deleteProject.success(project));
}

export function* deleteCurrentProjectService() {
  const { projectId } = yield select(pathSelector);

  yield call(deleteProjectService, projectId);
}

export function* handleProjectDeleteService(project) {
  const { projectId } = yield select(pathSelector);

  if (project.id === projectId) {
    yield call(goToRootService);
  }

  yield put(handleProjectDelete(project));
}
