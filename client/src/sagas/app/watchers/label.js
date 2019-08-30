import { all, takeLatest } from 'redux-saga/effects';

import {
  addLabelToCardService,
  addLabelToCurrentCardService,
  addLabelToFilterInCurrentBoardService,
  createLabelInCurrentBoardService,
  deleteLabelService,
  removeLabelFromCardService,
  removeLabelFromCurrentCardService,
  removeLabelFromFilterInCurrentBoardService,
  updateLabelService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* () {
  yield all([
    /* eslint-disable max-len */
    takeLatest(EntryActionTypes.LABEL_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) => createLabelInCurrentBoardService(data)),
    takeLatest(EntryActionTypes.LABEL_UPDATE, ({ payload: { id, data } }) => updateLabelService(id, data)),
    /* eslint-enable max-len */
    takeLatest(EntryActionTypes.LABEL_DELETE, ({ payload: { id } }) => deleteLabelService(id)),
    /* eslint-disable max-len */
    takeLatest(EntryActionTypes.LABEL_TO_CARD_ADD, ({ payload: { id, cardId } }) => addLabelToCardService(id, cardId)),
    takeLatest(EntryActionTypes.LABEL_TO_CURRENT_CARD_ADD, ({ payload: { id } }) => addLabelToCurrentCardService(id)),
    takeLatest(EntryActionTypes.LABEL_FROM_CARD_REMOVE, ({ payload: { id, cardId } }) => removeLabelFromCardService(id, cardId)),
    takeLatest(EntryActionTypes.LABEL_FROM_CURRENT_CARD_REMOVE, ({ payload: { id } }) => removeLabelFromCurrentCardService(id)),
    takeLatest(EntryActionTypes.LABEL_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) => addLabelToFilterInCurrentBoardService(id)),
    takeLatest(EntryActionTypes.LABEL_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) => removeLabelFromFilterInCurrentBoardService(id)),
    /* eslint-enable max-len */
  ]);
}
