import { call, put, select } from 'redux-saga/effects';

import { goToProject, goToRoot } from './router';
import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';

export function* createProject(data) {
  yield put(actions.createProject(data));

  let project;
  let projectManagers;

  try {
    ({
      item: project,
      included: { projectManagers },
    } = yield call(request, api.createProject, data));
  } catch (error) {
    yield put(actions.createProject.failure(error));
    return;
  }

  yield put(actions.createProject.success(project, projectManagers));
  yield call(goToProject, project.id);
}

export function* handleProjectCreate({ id }) {
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

  yield put(actions.handleProjectCreate(project, users, projectManagers, boards, boardMemberships));
}

export function* updateProject(id, data) {
  yield put(actions.updateProject(id, data));

  let project;
  try {
    ({ item: project } = yield call(request, api.updateProject, id, data));
  } catch (error) {
    yield put(actions.updateProject.failure(id, error));
    return;
  }

  yield put(actions.updateProject.success(project));
}

export function* updateCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(updateProject, projectId, data);
}

export function* handleProjectUpdate(project) {
  yield put(actions.handleProjectUpdate(project));
}

export function* updateProjectBackgroundImage(id, data) {
  yield put(actions.updateProjectBackgroundImage(id));

  let project;
  try {
    ({ item: project } = yield call(request, api.updateProjectBackgroundImage, id, data));
  } catch (error) {
    yield put(actions.updateProjectBackgroundImage.failure(id, error));
    return;
  }

  yield put(actions.updateProjectBackgroundImage.success(project));
}

export function* updateCurrentProjectBackgroundImage(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(updateProjectBackgroundImage, projectId, data);
}

export function* deleteProject(id) {
  const { projectId } = yield select(selectors.selectPath);

  if (id === projectId) {
    yield call(goToRoot);
  }

  yield put(actions.deleteProject(id));

  let project;
  try {
    ({ item: project } = yield call(request, api.deleteProject, id));
  } catch (error) {
    yield put(actions.deleteProject.failure(id, error));
    return;
  }

  yield put(actions.deleteProject.success(project));
}

export function* deleteCurrentProject() {
  const { projectId } = yield select(selectors.selectPath);

  yield call(deleteProject, projectId);
}

export function* handleProjectDelete(project) {
  const { projectId } = yield select(selectors.selectPath);

  if (project.id === projectId) {
    yield call(goToRoot);
  }

  yield put(actions.handleProjectDelete(project));
}

export default {
  createProject,
  handleProjectCreate,
  updateProject,
  updateCurrentProject,
  handleProjectUpdate,
  updateProjectBackgroundImage,
  updateCurrentProjectBackgroundImage,
  deleteProject,
  deleteCurrentProject,
  handleProjectDelete,
};
