import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createProjectMembershipFailed,
  createProjectMembershipRequested,
  createProjectMembershipSucceeded,
  deleteProjectMembershipFailed,
  deleteProjectMembershipRequested,
  deleteProjectMembershipSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createProjectMembershipRequest(projectId, localId, data) {
  yield put(
    createProjectMembershipRequested(localId, {
      ...data,
      projectId,
    }),
  );

  try {
    const { item } = yield call(request, api.createProjectMembership, projectId, data);

    const action = createProjectMembershipSucceeded(localId, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createProjectMembershipFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteProjectMembershipRequest(id) {
  yield put(deleteProjectMembershipRequested(id));

  try {
    const { item } = yield call(request, api.deleteProjectMembership, id);

    const action = deleteProjectMembershipSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteProjectMembershipFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
