import { all, takeEvery } from 'redux-saga/effects';

import {
  addLabelToCardService,
  addLabelToCurrentCardService,
  addLabelToFilterInCurrentBoardService,
  createLabelInCurrentBoardService,
  deleteLabelService,
  handleLabelCreateService,
  handleLabelDeleteService,
  handleLabelFromCardRemoveService,
  handleLabelToCardAddService,
  handleLabelUpdateService,
  removeLabelFromCardService,
  removeLabelFromCurrentCardService,
  removeLabelFromFilterInCurrentBoardService,
  updateLabelService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* labelWatchers() {
  yield all([
    takeEvery(EntryActionTypes.LABEL_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      createLabelInCurrentBoardService(data),
    ),
    takeEvery(EntryActionTypes.LABEL_CREATE_HANDLE, ({ payload: { label } }) =>
      handleLabelCreateService(label),
    ),
    takeEvery(EntryActionTypes.LABEL_UPDATE, ({ payload: { id, data } }) =>
      updateLabelService(id, data),
    ),
    takeEvery(EntryActionTypes.LABEL_UPDATE_HANDLE, ({ payload: { label } }) =>
      handleLabelUpdateService(label),
    ),
    takeEvery(EntryActionTypes.LABEL_DELETE, ({ payload: { id } }) => deleteLabelService(id)),
    takeEvery(EntryActionTypes.LABEL_DELETE_HANDLE, ({ payload: { label } }) =>
      handleLabelDeleteService(label),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_CARD_ADD, ({ payload: { id, cardId } }) =>
      addLabelToCardService(id, cardId),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_CURRENT_CARD_ADD, ({ payload: { id } }) =>
      addLabelToCurrentCardService(id),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_CARD_ADD_HANDLE, ({ payload: { cardLabel } }) =>
      handleLabelToCardAddService(cardLabel),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_CARD_REMOVE, ({ payload: { id, cardId } }) =>
      removeLabelFromCardService(id, cardId),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_CURRENT_CARD_REMOVE, ({ payload: { id } }) =>
      removeLabelFromCurrentCardService(id),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_CARD_REMOVE_HANDLE, ({ payload: { cardLabel } }) =>
      handleLabelFromCardRemoveService(cardLabel),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) =>
      addLabelToFilterInCurrentBoardService(id),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) =>
      removeLabelFromFilterInCurrentBoardService(id),
    ),
  ]);
}
