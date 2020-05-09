import { call, put, select } from 'redux-saga/effects';

import { goToBoardService } from './router';
import { createCardRequest, deleteCardRequest, updateCardRequest } from '../requests';
import { listByIdSelector, nextCardPositionSelector, pathSelector } from '../../../selectors';
import { createCard, deleteCard, updateCard } from '../../../actions';
import { createLocalId } from '../../../utils/local-id';

export function* createCardService(listId, data) {
  const { boardId } = yield select(listByIdSelector, listId);

  const nextData = {
    ...data,
    position: yield select(nextCardPositionSelector, listId),
  };

  const localId = yield call(createLocalId);

  yield put(
    createCard({
      ...nextData,
      listId,
      boardId,
      id: localId,
    }),
  );

  yield call(createCardRequest, listId, localId, nextData);
}

export function* updateCardService(id, data) {
  yield put(updateCard(id, data));
  yield call(updateCardRequest, id, data);
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

  yield put(deleteCard(id));

  yield call(updateCardRequest, id, {
    listId,
    boardId,
    position,
  });
}

export function* transferCurrentCardService(boardId, listId, index) {
  const { cardId } = yield select(pathSelector);

  yield call(transferCardService, cardId, boardId, listId, index);
}

export function* deleteCardService(id) {
  const { cardId, boardId } = yield select(pathSelector);

  if (id === cardId) {
    yield call(goToBoardService, boardId);
  }

  yield put(deleteCard(id));
  yield call(deleteCardRequest, id);
}

export function* deleteCurrentCardService() {
  const { cardId } = yield select(pathSelector);

  yield call(deleteCardService, cardId);
}
