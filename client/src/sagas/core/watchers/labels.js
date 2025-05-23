/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* labelsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.LABEL_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      services.createLabelInCurrentBoard(data),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_CARD_CREATE, ({ payload: { cardId, data } }) =>
      services.createLabelFromCard(cardId, data),
    ),
    takeEvery(EntryActionTypes.LABEL_CREATE_HANDLE, ({ payload: { label } }) =>
      services.handleLabelCreate(label),
    ),
    takeEvery(EntryActionTypes.LABEL_UPDATE, ({ payload: { id, data } }) =>
      services.updateLabel(id, data),
    ),
    takeEvery(EntryActionTypes.LABEL_UPDATE_HANDLE, ({ payload: { label } }) =>
      services.handleLabelUpdate(label),
    ),
    takeEvery(EntryActionTypes.LABEL_MOVE, ({ payload: { id, index } }) =>
      services.moveLabel(id, index),
    ),
    takeEvery(EntryActionTypes.LABEL_DELETE, ({ payload: { id } }) => services.deleteLabel(id)),
    takeEvery(EntryActionTypes.LABEL_DELETE_HANDLE, ({ payload: { label } }) =>
      services.handleLabelDelete(label),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_CARD_ADD, ({ payload: { id, cardId } }) =>
      services.addLabelToCard(id, cardId),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_CURRENT_CARD_ADD, ({ payload: { id } }) =>
      services.addLabelToCurrentCard(id),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_CARD_ADD_HANDLE, ({ payload: { cardLabel } }) =>
      services.handleLabelToCardAdd(cardLabel),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_CARD_REMOVE, ({ payload: { id, cardId } }) =>
      services.removeLabelFromCard(id, cardId),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_CURRENT_CARD_REMOVE, ({ payload: { id } }) =>
      services.removeLabelFromCurrentCard(id),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_CARD_REMOVE_HANDLE, ({ payload: { cardLabel } }) =>
      services.handleLabelFromCardRemove(cardLabel),
    ),
    takeEvery(EntryActionTypes.LABEL_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) =>
      services.addLabelToFilterInCurrentBoard(id),
    ),
    takeEvery(EntryActionTypes.LABEL_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) =>
      services.removeLabelFromFilterInCurrentBoard(id),
    ),
  ]);
}
