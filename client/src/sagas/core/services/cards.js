import { call, put, select } from 'redux-saga/effects';

import { goToBoard, goToCard } from './router';
import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createCard(listId, data, autoOpen) {
  const { boardId } = yield select(selectors.selectListById, listId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextCardPosition, listId),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createCard({
      ...nextData,
      boardId,
      listId,
      id: localId,
    }),
  );

  let card;
  try {
    ({ item: card } = yield call(request, api.createCard, listId, nextData));
  } catch (error) {
    yield put(actions.createCard.failure(localId, error));
    return;
  }

  yield put(actions.createCard.success(localId, card));

  if (autoOpen) {
    yield call(goToCard, card.id);
  }
}

export function* handleCardCreate(card) {
  yield put(actions.handleCardCreate(card));
}

export function* updateCard(id, data) {
  yield put(actions.updateCard(id, data));

  let card;
  try {
    ({ item: card } = yield call(request, api.updateCard, id, data));
  } catch (error) {
    yield put(actions.updateCard.failure(id, error));
    return;
  }

  yield put(actions.updateCard.success(card));
}

export function* updateCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(updateCard, cardId, data);
}

// TODO: handle card transfer
export function* handleCardUpdate(card) {
  yield put(actions.handleCardUpdate(card));
}

export function* moveCard(id, listId, index) {
  const position = yield select(selectors.selectNextCardPosition, listId, index, id);

  yield call(updateCard, id, {
    listId,
    position,
  });
}

export function* moveCurrentCard(listId, index) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(moveCard, cardId, listId, index);
}

export function* transferCard(id, boardId, listId, index) {
  const { cardId: currentCardId, boardId: currentBoardId } = yield select(selectors.selectPath);
  const position = yield select(selectors.selectNextCardPosition, listId, index, id);

  if (id === currentCardId) {
    yield call(goToBoard, currentBoardId);
  }

  yield call(updateCard, id, {
    boardId,
    listId,
    position,
  });
}

export function* transferCurrentCard(boardId, listId, index) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(transferCard, cardId, boardId, listId, index);
}

export function* deleteCard(id) {
  const { cardId, boardId } = yield select(selectors.selectPath);

  if (id === cardId) {
    yield call(goToBoard, boardId);
  }

  yield put(actions.deleteCard(id));

  let card;
  try {
    ({ item: card } = yield call(request, api.deleteCard, id));
  } catch (error) {
    yield put(actions.deleteCard.failure(id, error));
    return;
  }

  yield put(actions.deleteCard.success(card));
}

export function* deleteCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(deleteCard, cardId);
}

export function* handleCardDelete(card) {
  const { cardId, boardId } = yield select(selectors.selectPath);

  if (card.id === cardId) {
    yield call(goToBoard, boardId);
  }

  yield put(actions.handleCardDelete(card));
}

export default {
  createCard,
  handleCardCreate,
  updateCard,
  updateCurrentCard,
  moveCard,
  moveCurrentCard,
  transferCard,
  transferCurrentCard,
  handleCardUpdate,
  deleteCard,
  deleteCurrentCard,
  handleCardDelete,
};
