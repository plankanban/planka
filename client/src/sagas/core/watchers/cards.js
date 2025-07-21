/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* cardsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CARDS_IN_CURRENT_LIST_FETCH, () =>
      services.fetchCardsInCurrentList(),
    ),
    takeEvery(EntryActionTypes.CARDS_UPDATE_HANDLE, ({ payload: { cards, activities } }) =>
      services.handleCardsUpdate(cards, activities),
    ),
    takeEvery(EntryActionTypes.CARD_CREATE, ({ payload: { listId, data, index, autoOpen } }) =>
      services.createCard(listId, data, index, autoOpen),
    ),
    takeEvery(
      EntryActionTypes.CARD_IN_FIRST_FINITE_LIST_CREATE,
      ({ payload: { data, index, autoOpen } }) =>
        services.createCardInFirstFiniteList(data, index, autoOpen),
    ),
    takeEvery(EntryActionTypes.CARD_IN_CURRENT_LIST_CREATE, ({ payload: { data, autoOpen } }) =>
      services.createCardInCurrentList(data, autoOpen),
    ),
    takeEvery(EntryActionTypes.CARD_CREATE_HANDLE, ({ payload: { card } }) =>
      services.handleCardCreate(card),
    ),
    takeEvery(EntryActionTypes.CARD_UPDATE, ({ payload: { id, data } }) =>
      services.updateCard(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentCard(data),
    ),
    takeEvery(EntryActionTypes.CARD_UPDATE_HANDLE, ({ payload: { card } }) =>
      services.handleCardUpdate(card),
    ),
    takeEvery(EntryActionTypes.CARD_MOVE, ({ payload: { id, listId, index } }) =>
      services.moveCard(id, listId, index),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_MOVE, ({ payload: { listId, index, autoClose } }) =>
      services.moveCurrentCard(listId, index, autoClose),
    ),
    takeEvery(EntryActionTypes.CARD_TO_ARCHIVE_MOVE, ({ payload: { id } }) =>
      services.moveCardToArchive(id),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_TO_ARCHIVE_MOVE, () =>
      services.moveCurrentCardToArchive(),
    ),
    takeEvery(EntryActionTypes.CARD_TO_TRASH_MOVE, ({ payload: { id } }) =>
      services.moveCardToTrash(id),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_TO_TRASH_MOVE, () => services.moveCurrentCardToTrash()),
    takeEvery(EntryActionTypes.CARD_TRANSFER, ({ payload: { id, boardId, listId, index } }) =>
      services.transferCard(id, boardId, listId, index),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_TRANSFER, ({ payload: { boardId, listId, index } }) =>
      services.transferCurrentCard(boardId, listId, index),
    ),
    takeEvery(EntryActionTypes.CARD_DUPLICATE, ({ payload: { id, data } }) =>
      services.duplicateCard(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_DUPLICATE, ({ payload: { data } }) =>
      services.duplicateCurrentCard(data),
    ),
    takeEvery(EntryActionTypes.TO_ADJACENT_CARD_GO, ({ payload: { direction } }) =>
      services.goToAdjacentCard(direction),
    ),
    takeEvery(EntryActionTypes.CARD_DELETE, ({ payload: { id } }) => services.deleteCard(id)),
    takeEvery(EntryActionTypes.CURRENT_CARD_DELETE, () => services.deleteCurrentCard()),
    takeEvery(EntryActionTypes.CARD_DELETE_HANDLE, ({ payload: { card } }) =>
      services.handleCardDelete(card),
    ),
  ]);
}
