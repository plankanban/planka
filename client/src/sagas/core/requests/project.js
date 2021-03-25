import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createProjectFailed,
  createProjectRequested,
  createProjectSucceeded,
  deleteProjectFailed,
  deleteProjectRequested,
  deleteProjectSucceeded,
  importProjectFailed,
  importProjectRequested,
  importProjectSucceeded,
  updateProjectBackgroundImageFailed,
  updateProjectBackgroundImageRequested,
  updateProjectBackgroundImageSucceeded,
  updateProjectFailed,
  updateProjectRequested,
  updateProjectSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createProjectRequest(data) {
  yield put(createProjectRequested(data));

  try {
    const {
      item,
      included: { users, projectMemberships, boards },
    } = yield call(request, api.createProject, data);

    const action = createProjectSucceeded(item, users, projectMemberships, boards);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createProjectFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* importProjectRequest(data) {
  yield put(importProjectRequested(data));

  try {
    const {
      item,
      included: { users, projectMemberships, boards },
    } = yield call(request, api.importProject, { file: data });

    const action = importProjectSucceeded(item, users, projectMemberships, boards);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = importProjectFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateProjectRequest(id, data) {
  yield put(updateProjectRequested(id, data));

  try {
    const { item } = yield call(request, api.updateProject, id, data);

    const action = updateProjectSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateProjectFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateProjectBackgroundImageRequest(id, data) {
  yield put(updateProjectBackgroundImageRequested(id));

  try {
    const { item } = yield call(request, api.updateProjectBackgroundImage, id, data);

    const action = updateProjectBackgroundImageSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateProjectBackgroundImageFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteProjectRequest(id) {
  yield put(deleteProjectRequested(id));

  try {
    const { item } = yield call(request, api.deleteProject, id);

    const action = deleteProjectSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteProjectFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
