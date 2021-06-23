import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { lastActionIdByCardIdSelector, pathSelector } from '../../../selectors';
import { fetchActions } from '../../../actions';
import api from '../../../api';

export function* fetchActionsService(cardId) {
  const lastId = yield select(lastActionIdByCardIdSelector, cardId);

  yield put(fetchActions(cardId));

  let actions;
  let users;

  try {
    ({
      items: actions,
      included: { users },
    } = yield call(request, api.getActions, cardId, {
      beforeId: lastId,
    }));
  } catch (error) {
    yield put(fetchActions.failure(cardId, error));
    return;
  }

  yield put(fetchActions.success(cardId, actions, users));
}

export function* fetchActionsInCurrentCardService() {
  const { cardId } = yield select(pathSelector);

  yield call(fetchActionsService, cardId);
}
