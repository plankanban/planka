import { call, put } from 'redux-saga/effects';

import request from './request';
import { fetchActionsFailed, fetchActionsRequested, fetchActionsSucceeded } from '../../../actions';
import api from '../../../api';

// eslint-disable-next-line import/prefer-default-export
export function* fetchActionsRequest(cardId, beforeId) {
  yield put(fetchActionsRequested(cardId));

  try {
    const {
      items,
      included: { users },
    } = yield call(request, api.getActions, cardId, {
      beforeId,
    });

    const action = fetchActionsSucceeded(cardId, items, users);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = fetchActionsFailed(cardId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
