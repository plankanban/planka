import { all, takeEvery } from 'redux-saga/effects';

import {
  createCardService,
  deleteCardService,
  deleteCurrentCardService,
  handleCardCreateService,
  handleCardDeleteService,
  handleCardUpdateService,
  moveCardService,
  moveCurrentCardService,
  transferCardService,
  transferCurrentCardService,
  updateCardService,
  updateCurrentCardService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* cardWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CARD_CREATE, ({ payload: { listId, data } }) =>
      createCardService(listId, data),
    ),
    takeEvery(EntryActionTypes.CARD_CREATE_HANDLE, ({ payload: { card } }) =>
      handleCardCreateService(card),
    ),
    takeEvery(EntryActionTypes.CARD_UPDATE, ({ payload: { id, data } }) =>
      updateCardService(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_UPDATE, ({ payload: { data } }) =>
      updateCurrentCardService(data),
    ),
    takeEvery(EntryActionTypes.CARD_UPDATE_HANDLE, ({ payload: { card } }) =>
      handleCardUpdateService(card),
    ),
    takeEvery(EntryActionTypes.CARD_MOVE, ({ payload: { id, listId, index } }) =>
      moveCardService(id, listId, index),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_MOVE, ({ payload: { listId, index } }) =>
      moveCurrentCardService(listId, index),
    ),
    takeEvery(EntryActionTypes.CARD_TRANSFER, ({ payload: { id, boardId, listId, index } }) =>
      transferCardService(id, boardId, listId, index),
    ),
    takeEvery(EntryActionTypes.CURRENT_CARD_TRANSFER, ({ payload: { boardId, listId, index } }) =>
      transferCurrentCardService(boardId, listId, index),
    ),
    takeEvery(EntryActionTypes.CARD_DELETE, ({ payload: { id } }) => deleteCardService(id)),
    takeEvery(EntryActionTypes.CURRENT_CARD_DELETE, () => deleteCurrentCardService()),
    takeEvery(EntryActionTypes.CARD_DELETE_HANDLE, ({ payload: { card } }) =>
      handleCardDeleteService(card),
    ),
  ]);
}
