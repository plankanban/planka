import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* cardsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CARD_CREATE, ({ payload: { listId, data, autoOpen } }) =>
      services.createCard(listId, data, autoOpen),
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
    takeEvery(EntryActionTypes.CURRENT_CARD_MOVE, ({ payload: { listId, index } }) =>
      services.moveCurrentCard(listId, index),
    ),
    takeEvery(EntryActionTypes.CARD_TRANSFER, ({ payload: { id, boardId, listId, index } }) =>
      services.transferCard(id, boardId, listId, index),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_TRANSFER, ({ payload: { boardId, listId, index } }) =>
      services.transferCurrentCard(boardId, listId, index),
    ),
    takeEvery(EntryActionTypes.CARD_DUPLICATE, ({ payload: { id } }) => services.duplicateCard(id)),
    takeEvery(EntryActionTypes.CURRENT_CARD_DUPLICATE, () => services.duplicateCurrentCard()),
    takeEvery(EntryActionTypes.CARD_DELETE, ({ payload: { id } }) => services.deleteCard(id)),
    takeEvery(EntryActionTypes.CURRENT_CARD_DELETE, () => services.deleteCurrentCard()),
    takeEvery(EntryActionTypes.CARD_DELETE_HANDLE, ({ payload: { card } }) =>
      services.handleCardDelete(card),
    ),
    takeEvery(EntryActionTypes.TEXT_FILTER_IN_CURRENT_BOARD, ({ payload: { text } }) =>
      services.handleTextFilter(text),
    ),
  ]);
}
