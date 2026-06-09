/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* cardRelationsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CARD_RELATION_CREATE, ({ payload: { cardId, data } }) =>
      services.createCardRelation(cardId, data),
    ),
    takeEvery(EntryActionTypes.CARD_RELATION_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      services.createCardRelationInCurrentCard(data),
    ),
    takeEvery(EntryActionTypes.CARD_RELATION_CREATE_HANDLE, ({ payload: { cardRelation } }) =>
      services.handleCardRelationCreate(cardRelation),
    ),
    takeEvery(EntryActionTypes.CARD_RELATION_DELETE, ({ payload: { cardId, id } }) =>
      services.deleteCardRelation(cardId, id),
    ),
    takeEvery(EntryActionTypes.CARD_RELATION_IN_CURRENT_CARD_DELETE, ({ payload: { id } }) =>
      services.deleteCurrentCardRelation(id),
    ),
    takeEvery(EntryActionTypes.CARD_RELATION_DELETE_HANDLE, ({ payload: { cardRelation } }) =>
      services.handleCardRelationDelete(cardRelation),
    ),
  ]);
}
