import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createCardFailed,
  createCardRequested,
  createCardSucceeded,
  deleteCardFailed,
  deleteCardRequested,
  deleteCardSucceeded,
  fetchCardFailed,
  fetchCardRequested,
  fetchCardSucceeded,
  updateCardFailed,
  updateCardRequested,
  updateCardSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createCardRequest(boardId, localId, data) {
  yield put(
    createCardRequested(localId, {
      ...data,
      boardId,
    }),
  );

  try {
    const {
      item,
      included: { cardMemberships, cardLabels, tasks, attachments },
    } = yield call(request, api.createCard, boardId, data);

    const action = createCardSucceeded(
      localId,
      item,
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
    const action = createCardFailed(localId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* fetchCardRequest(id) {
  yield put(fetchCardRequested(id));

  try {
    const { item } = yield call(request, api.getCard, id);

    const action = fetchCardSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = fetchCardFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateCardRequest(id, data) {
  yield put(updateCardRequested(id, data));

  try {
    const { item } = yield call(request, api.updateCard, id, data);

    const action = updateCardSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateCardFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteCardRequest(id) {
  yield put(deleteCardRequested(id));

  try {
    const { item } = yield call(request, api.deleteCard, id);

    const action = deleteCardSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteCardFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
