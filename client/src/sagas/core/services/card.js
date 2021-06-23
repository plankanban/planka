import { call, put, select } from 'redux-saga/effects';

import { goToBoardService } from './router';
import request from '../request';
import { listByIdSelector, nextCardPositionSelector, pathSelector } from '../../../selectors';
import {
  createCard,
  deleteCard,
  handleCardCreate,
  handleCardDelete,
  handleCardUpdate,
  updateCard,
} from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createCardService(listId, data) {
  const { boardId } = yield select(listByIdSelector, listId);

  const nextData = {
    ...data,
    listId,
    position: yield select(nextCardPositionSelector, listId),
  };

  const localId = yield call(createLocalId);

  yield put(
    createCard({
      ...nextData,
      boardId,
      id: localId,
    }),
  );

  let card;
  try {
    ({ item: card } = yield call(request, api.createCard, boardId, nextData));
  } catch (error) {
    yield put(createCard.failure(localId, error));
    return;
  }

  yield put(createCard.success(localId, card));
}

export function* handleCardCreateService(card) {
  yield put(handleCardCreate(card));
}

export function* updateCardService(id, data) {
  yield put(updateCard(id, data));

  let card;
  try {
    ({ item: card } = yield call(request, api.updateCard, id, data));
  } catch (error) {
    yield put(updateCard.failure(id, error));
    return;
  }

  yield put(updateCard.success(card));
}

export function* updateCurrentCardService(data) {
  const { cardId } = yield select(pathSelector);

  yield call(updateCardService, cardId, data);
}

export function* moveCardService(id, listId, index) {
  const position = yield select(nextCardPositionSelector, listId, index, id);

  yield call(updateCardService, id, {
    listId,
    position,
  });
}

export function* moveCurrentCardService(listId, index) {
  const { cardId } = yield select(pathSelector);

  yield call(moveCardService, cardId, listId, index);
}

export function* transferCardService(id, boardId, listId, index) {
  const { cardId: currentCardId, boardId: currentBoardId } = yield select(pathSelector);
  const position = yield select(nextCardPositionSelector, listId, index, id);

  if (id === currentCardId) {
    yield call(goToBoardService, currentBoardId);
  }

  yield call(updateCardService, id, {
    boardId,
    listId,
    position,
  });
}

export function* transferCurrentCardService(boardId, listId, index) {
  const { cardId } = yield select(pathSelector);

  yield call(transferCardService, cardId, boardId, listId, index);
}

export function* handleCardUpdateService(card) {
  yield put(handleCardUpdate(card)); // TODO: handle card transfer
}

export function* deleteCardService(id) {
  const { cardId, boardId } = yield select(pathSelector);

  if (id === cardId) {
    yield call(goToBoardService, boardId);
  }

  yield put(deleteCard(id));

  let card;
  try {
    ({ item: card } = yield call(request, api.deleteCard, id));
  } catch (error) {
    yield put(deleteCard.failure(id, error));
    return;
  }

  yield put(deleteCard.success(card));
}

export function* deleteCurrentCardService() {
  const { cardId } = yield select(pathSelector);

  yield call(deleteCardService, cardId);
}

export function* handleCardDeleteService(card) {
  const { cardId, boardId } = yield select(pathSelector);

  if (card.id === cardId) {
    yield call(goToBoardService, boardId);
  }

  yield put(handleCardDelete(card));
}
