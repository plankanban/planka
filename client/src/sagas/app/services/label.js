import { call, put, select } from 'redux-saga/effects';

import {
  createCardLabelRequest,
  createLabelRequest,
  deleteCardLabelRequest,
  deleteLabelRequest,
  updateLabelRequest,
} from '../requests';
import { pathSelector } from '../../../selectors';
import {
  addLabelToBoardFilter,
  addLabelToCard,
  createLabel,
  deleteLabel,
  removeLabelFromBoardFilter,
  removeLabelFromCard,
  updateLabel,
} from '../../../actions';
import { createLocalId } from '../../../utils/local-id';

export function* createLabelService(boardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    createLabel({
      ...data,
      boardId,
      id: localId,
    }),
  );

  yield call(createLabelRequest, boardId, localId, data);
}

export function* createLabelInCurrentBoardService(data) {
  const { boardId } = yield select(pathSelector);

  yield call(createLabelService, boardId, data);
}

export function* updateLabelService(id, data) {
  yield put(updateLabel(id, data));
  yield call(updateLabelRequest, id, data);
}

export function* deleteLabelService(id) {
  yield put(deleteLabel(id));
  yield call(deleteLabelRequest, id);
}

export function* addLabelToCardService(id, cardId) {
  yield put(addLabelToCard(id, cardId));
  yield call(createCardLabelRequest, cardId, id);
}

export function* addLabelToCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(addLabelToCardService, id, cardId);
}

export function* removeLabelFromCardService(id, cardId) {
  yield put(removeLabelFromCard(id, cardId));
  yield call(deleteCardLabelRequest, cardId, id);
}

export function* removeLabelFromCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(removeLabelFromCardService, id, cardId);
}

export function* addLabelToBoardFilterService(id, boardId) {
  yield put(addLabelToBoardFilter(id, boardId));
}

export function* addLabelToFilterInCurrentBoardService(id) {
  const { boardId } = yield select(pathSelector);

  yield call(addLabelToBoardFilterService, id, boardId);
}

export function* removeLabelFromBoardFilterService(id, boardId) {
  yield put(removeLabelFromBoardFilter(id, boardId));
}

export function* removeLabelFromFilterInCurrentBoardService(id) {
  const { boardId } = yield select(pathSelector);

  yield call(removeLabelFromBoardFilterService, id, boardId);
}
