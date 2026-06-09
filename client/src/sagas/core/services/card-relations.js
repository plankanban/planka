/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';

export function* createCardRelation(cardId, data) {
  yield put(actions.createCardRelation(cardId, data));

  let cardRelation;
  try {
    ({ item: cardRelation } = yield call(request, api.createCardRelation, cardId, data));
  } catch (error) {
    yield put(actions.createCardRelation.failure(cardId, error));
    return;
  }

  yield put(actions.createCardRelation.success(cardRelation));
}

export function* createCardRelationInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createCardRelation, cardId, data);
}

export function* handleCardRelationCreate(cardRelation) {
  yield put(actions.handleCardRelationCreate(cardRelation));
}

export function* deleteCardRelation(cardId, id) {
  yield put(actions.deleteCardRelation(cardId, id));

  let cardRelation;
  try {
    ({ item: cardRelation } = yield call(request, api.deleteCardRelation, cardId, id));
  } catch (error) {
    yield put(actions.deleteCardRelation.failure(cardId, id, error));
    return;
  }

  yield put(actions.deleteCardRelation.success(cardRelation));
}

export function* deleteCurrentCardRelation(id) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(deleteCardRelation, cardId, id);
}

export function* handleCardRelationDelete(cardRelation) {
  yield put(actions.handleCardRelationDelete(cardRelation));
}

export default {
  createCardRelation,
  createCardRelationInCurrentCard,
  handleCardRelationCreate,
  deleteCardRelation,
  deleteCurrentCardRelation,
  handleCardRelationDelete,
};
