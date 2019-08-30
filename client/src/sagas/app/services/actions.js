import { call, select } from 'redux-saga/effects';

import { fetchActionsRequest } from '../requests';
import { lastActionIdByCardIdSelector, pathSelector } from '../../../selectors';

export function* fetchActionsService(cardId) {
  const lastId = yield select(lastActionIdByCardIdSelector, cardId);

  yield call(fetchActionsRequest, cardId, lastId);
}

export function* fetchActionsInCurrentCardService() {
  const { cardId } = yield select(pathSelector);

  yield call(fetchActionsService, cardId);
}
