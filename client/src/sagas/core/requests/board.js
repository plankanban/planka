import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createBoardFailed,
  createBoardRequested,
  createBoardSucceeded,
  deleteBoardFailed,
  deleteBoardRequested,
  deleteBoardSucceeded,
  fetchBoardFailed,
  fetchBoardRequested,
  fetchBoardSucceeded,
  updateBoardFailed,
  updateBoardRequested,
  updateBoardSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createBoardRequest(projectId, localId, data) {
  yield put(
    createBoardRequested(localId, {
      ...data,
      projectId,
    }),
  );

  try {
    const {
      item,
      included: { lists, labels },
    } = yield call(request, api.createBoard, projectId, data);

    const action = createBoardSucceeded(localId, item, lists, labels);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createBoardFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* fetchBoardRequest(id) {
  yield put(fetchBoardRequested(id));

  try {
    const {
      item,
      included: { labels, lists, cards, cardMemberships, cardLabels, tasks, attachments },
    } = yield call(request, api.getBoard, id);

    const action = fetchBoardSucceeded(
      item,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      tasks,
      attachments,
    );
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = fetchBoardFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateBoardRequest(id, data) {
  yield put(updateBoardRequested(id, data));

  try {
    const { item } = yield call(request, api.updateBoard, id, data);

    const action = updateBoardSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateBoardFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteBoardRequest(id) {
  yield put(deleteBoardRequested(id));

  try {
    const { item } = yield call(request, api.deleteBoard, id);

    const action = deleteBoardSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteBoardFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
