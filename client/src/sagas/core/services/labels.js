import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createLabel(boardId, data) {
  const nextData = {
    ...data,
    position: yield select(selectors.selectNextLabelPosition, boardId),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createLabel({
      ...nextData,
      boardId,
      id: localId,
    }),
  );

  let label;
  try {
    ({ item: label } = yield call(request, api.createLabel, boardId, nextData));
  } catch (error) {
    yield put(actions.createLabel.failure(localId, error));
    return;
  }

  yield put(actions.createLabel.success(localId, label));
}

export function* createLabelInCurrentBoard(data) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(createLabel, boardId, data);
}

export function* handleLabelCreate(label) {
  yield put(actions.handleLabelCreate(label));
}

export function* updateLabel(id, data) {
  yield put(actions.updateLabel(id, data));

  let label;
  try {
    ({ item: label } = yield call(request, api.updateLabel, id, data));
  } catch (error) {
    yield put(actions.updateLabel.failure(id, error));
    return;
  }

  yield put(actions.updateLabel.success(label));
}

export function* handleLabelUpdate(label) {
  yield put(actions.handleLabelUpdate(label));
}

export function* moveLabel(id, index) {
  const { boardId } = yield select(selectors.selectLabelById, id);
  const position = yield select(selectors.selectNextLabelPosition, boardId, index, id);

  yield call(updateLabel, id, {
    position,
  });
}

export function* deleteLabel(id) {
  yield put(actions.deleteLabel(id));

  let label;
  try {
    ({ item: label } = yield call(request, api.deleteLabel, id));
  } catch (error) {
    yield put(actions.deleteLabel.failure(id, error));
    return;
  }

  yield put(actions.deleteLabel.success(label));
}

export function* handleLabelDelete(label) {
  yield put(actions.handleLabelDelete(label));
}

export function* addLabelToCard(id, cardId) {
  yield put(actions.addLabelToCard(id, cardId));

  let cardLabel;
  try {
    ({ item: cardLabel } = yield call(request, api.createCardLabel, cardId, {
      labelId: id,
    }));
  } catch (error) {
    yield put(actions.addLabelToCard.failure(id, cardId, error));
    return;
  }

  yield put(actions.addLabelToCard.success(cardLabel));
}

export function* addLabelToCurrentCard(id) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(addLabelToCard, id, cardId);
}

export function* handleLabelToCardAdd(cardLabel) {
  yield put(actions.handleLabelToCardAdd(cardLabel));
}

export function* removeLabelFromCard(id, cardId) {
  yield put(actions.removeLabelFromCard(id, cardId));

  let cardLabel;
  try {
    ({ item: cardLabel } = yield call(request, api.deleteCardLabel, cardId, id));
  } catch (error) {
    yield put(actions.removeLabelFromCard.failure(id, cardId, error));
    return;
  }

  yield put(actions.removeLabelFromCard.success(cardLabel));
}

export function* removeLabelFromCurrentCard(id) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(removeLabelFromCard, id, cardId);
}

export function* handleLabelFromCardRemove(cardLabel) {
  yield put(actions.handleLabelFromCardRemove(cardLabel));
}

export function* addLabelToBoardFilter(id, boardId) {
  yield put(actions.addLabelToBoardFilter(id, boardId));
}

export function* addLabelToFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(addLabelToBoardFilter, id, boardId);
}

export function* removeLabelFromBoardFilter(id, boardId) {
  yield put(actions.removeLabelFromBoardFilter(id, boardId));
}

export function* removeLabelFromFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(removeLabelFromBoardFilter, id, boardId);
}

export default {
  createLabel,
  createLabelInCurrentBoard,
  handleLabelCreate,
  updateLabel,
  handleLabelUpdate,
  moveLabel,
  deleteLabel,
  handleLabelDelete,
  addLabelToCard,
  addLabelToCurrentCard,
  handleLabelToCardAdd,
  removeLabelFromCard,
  removeLabelFromCurrentCard,
  handleLabelFromCardRemove,
  addLabelToBoardFilter,
  addLabelToFilterInCurrentBoard,
  removeLabelFromBoardFilter,
  removeLabelFromFilterInCurrentBoard,
};
