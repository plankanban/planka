import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { cardByIdSelector, lastActionIdByCardIdSelector, pathSelector } from '../../../selectors';
import { fetchActions, toggleActionsDetails } from '../../../actions';
import api from '../../../api';

export function* fetchActionsService(cardId) {
  const { isActionsDetailsVisible } = yield select(cardByIdSelector, cardId);
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
      withDetails: isActionsDetailsVisible,
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

export function* toggleActionsDetailsService(cardId, isVisible) {
  yield put(toggleActionsDetails(cardId, isVisible));

  if (isVisible) {
    let actions;
    let users;

    try {
      ({
        items: actions,
        included: { users },
      } = yield call(request, api.getActions, cardId, {
        withDetails: isVisible,
      }));
    } catch (error) {
      yield put(toggleActionsDetails.failure(cardId, error));
      return;
    }

    yield put(toggleActionsDetails.success(cardId, actions, users));
  }
}

export function* toggleActionsDetailsInCurrentCardService(isVisible) {
  const { cardId } = yield select(pathSelector);

  yield call(toggleActionsDetailsService, cardId, isVisible);
}
