import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { pathSelector } from '../../../selectors';
import {
  addLabelToBoardFilter,
  addLabelToCard,
  createLabel,
  deleteLabel,
  handleLabelCreate,
  handleLabelDelete,
  handleLabelFromCardRemove,
  handleLabelToCardAdd,
  handleLabelUpdate,
  removeLabelFromBoardFilter,
  removeLabelFromCard,
  updateLabel,
} from '../../../actions';
import api from '../../../api';
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

  let label;
  try {
    ({ item: label } = yield call(request, api.createLabel, boardId, data));
  } catch (error) {
    yield put(createLabel.failure(localId, error));
    return;
  }

  yield put(createLabel.success(localId, label));
}

export function* createLabelInCurrentBoardService(data) {
  const { boardId } = yield select(pathSelector);

  yield call(createLabelService, boardId, data);
}

export function* handleLabelCreateService(label) {
  yield put(handleLabelCreate(label));
}

export function* updateLabelService(id, data) {
  yield put(updateLabel(id, data));

  let label;
  try {
    ({ item: label } = yield call(request, api.updateLabel, id, data));
  } catch (error) {
    yield put(updateLabel.failure(id, error));
    return;
  }

  yield put(updateLabel.success(label));
}

export function* handleLabelUpdateService(label) {
  yield put(handleLabelUpdate(label));
}

export function* deleteLabelService(id) {
  yield put(deleteLabel(id));

  let label;
  try {
    ({ item: label } = yield call(request, api.deleteLabel, id));
  } catch (error) {
    yield put(deleteLabel.failure(id, error));
    return;
  }

  yield put(deleteLabel.success(label));
}

export function* handleLabelDeleteService(label) {
  yield put(handleLabelDelete(label));
}

export function* addLabelToCardService(id, cardId) {
  yield put(addLabelToCard(id, cardId));

  let cardLabel;
  try {
    ({ item: cardLabel } = yield call(request, api.createCardLabel, cardId, {
      labelId: id,
    }));
  } catch (error) {
    yield put(addLabelToCard.failure(id, cardId, error));
    return;
  }

  yield put(addLabelToCard.success(cardLabel));
}

export function* addLabelToCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(addLabelToCardService, id, cardId);
}

export function* handleLabelToCardAddService(cardLabel) {
  yield put(handleLabelToCardAdd(cardLabel));
}

export function* removeLabelFromCardService(id, cardId) {
  yield put(removeLabelFromCard(id, cardId));

  let cardLabel;
  try {
    ({ item: cardLabel } = yield call(request, api.deleteCardLabel, cardId, id));
  } catch (error) {
    yield put(removeLabelFromCard.failure(id, cardId, error));
    return;
  }

  yield put(removeLabelFromCard.success(cardLabel));
}

export function* removeLabelFromCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(removeLabelFromCardService, id, cardId);
}

export function* handleLabelFromCardRemoveService(cardLabel) {
  yield put(handleLabelFromCardRemove(cardLabel));
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
