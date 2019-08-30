import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createCardLabelFailed,
  createCardLabelRequested,
  createCardLabelSucceeded,
  deleteCardLabelFailed,
  deleteCardLabelRequested,
  deleteCardLabelSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createCardLabelRequest(cardId, labelId) {
  yield put(
    createCardLabelRequested({
      cardId,
      labelId,
    }),
  );

  try {
    const { item } = yield call(request, api.createCardLabel, cardId, {
      labelId,
    });

    const action = createCardLabelSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createCardLabelFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteCardLabelRequest(cardId, labelId) {
  yield put(deleteCardLabelRequested(cardId, labelId));

  try {
    const { item } = yield call(request, api.deleteCardLabel, cardId, labelId);

    const action = deleteCardLabelSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteCardLabelFailed(cardId, labelId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
