import { call, put, select } from 'redux-saga/effects';

import { goToBoard, goToCard } from './router';
import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
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

export function* handleCardCreate({ id }) {
  let card;
  let cardMemberships;
  let cardLabels;
  let tasks;
  let attachments;

  try {
    ({
      item: card,
      included: { cardMemberships, cardLabels, tasks, attachments },
    } = yield call(request, api.getCard, id));
  } catch (error) {
    return;
  }

  yield put(actions.handleCardCreate(card, cardMemberships, cardLabels, tasks, attachments));
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

export function* handleCardUpdate(card) {
  let fetch = false;
  if (card.boardId) {
    const prevCard = yield select(selectors.selectCardById, card.id);
    fetch = !prevCard || prevCard.boardId !== card.boardId;
  }

  let cardMemberships;
  let cardLabels;
  let tasks;
  let attachments;

  if (fetch) {
    try {
      ({
        item: card, // eslint-disable-line no-param-reassign
        included: { cardMemberships, cardLabels, tasks, attachments },
      } = yield call(request, api.getCard, card.id));
    } catch (error) {
      fetch = false;
    }
  }

  yield put(actions.handleCardUpdate(card, fetch, cardMemberships, cardLabels, tasks, attachments));
}

export function* moveCard(id, listId, index = 0) {
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

export function* transferCard(id, boardId, listId, index = 0) {
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

export function* duplicateCard(id) {
  const { listId, name } = yield select(selectors.selectCardById, id);
  const index = yield select(selectors.selectCardIndexById, id);

  const nextData = {
    position: yield select(selectors.selectNextCardPosition, listId, index + 1),
    name: `${name} (${i18n.t('common.copy', {
      context: 'inline',
    })})`,
  };

  const localId = yield call(createLocalId);
  const taskIds = yield select(selectors.selectTaskIdsByCardId, id);

  yield put(
    actions.duplicateCard(
      id,
      {
        ...nextData,
        id: localId,
      },
      taskIds,
    ),
  );

  let card;
  let cardMemberships;
  let cardLabels;
  let tasks;

  try {
    ({
      item: card,
      included: { cardMemberships, cardLabels, tasks },
    } = yield call(request, api.duplicateCard, id, nextData));
  } catch (error) {
    yield put(actions.duplicateCard.failure(localId, error));
    return;
  }

  yield put(actions.duplicateCard.success(localId, card, cardMemberships, cardLabels, tasks));
}

export function* duplicateCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(duplicateCard, cardId);
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

export function* handleTextFilter(text) {
  const { boardId } = yield select(selectors.selectPath);

  yield put(actions.filterText(boardId, text));
}

export default {
  createCard,
  handleCardCreate,
  updateCard,
  updateCurrentCard,
  handleCardUpdate,
  moveCard,
  moveCurrentCard,
  transferCard,
  transferCurrentCard,
  duplicateCard,
  duplicateCurrentCard,
  deleteCard,
  deleteCurrentCard,
  handleCardDelete,
  handleTextFilter,
};
