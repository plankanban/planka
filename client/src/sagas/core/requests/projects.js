import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  fetchProjectsFailed,
  fetchProjectsRequested,
  fetchProjectsSucceeded,
} from '../../../actions';
import api from '../../../api';

// eslint-disable-next-line import/prefer-default-export
export function* fetchProjectsRequest() {
  yield put(fetchProjectsRequested());

  try {
    const {
      items,
      included: { users, projectMemberships, boards },
    } = yield call(request, api.getProjects);

    const action = fetchProjectsSucceeded(items, users, projectMemberships, boards);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = fetchProjectsFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
