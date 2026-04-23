/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, fork, join, put, race, select, take } from 'redux-saga/effects';
import toast from 'react-hot-toast';
import { LOCATION_CHANGE_HANDLE } from '../../../lib/redux-router';

import { goToBoard, goToCard } from './router';
import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
import { createLocalId } from '../../../utils/local-id';
import { isListArchiveOrTrash, isListFinite } from '../../../utils/record-helpers';
import ActionTypes from '../../../constants/ActionTypes';
import ClipboardTypes from '../../../constants/ClipboardTypes';
import ToastTypes from '../../../constants/ToastTypes';
import { BoardViews, ListTypes, ListTypeStates } from '../../../constants/Enums';
import LIST_TYPE_STATE_BY_TYPE from '../../../constants/ListTypeStateByType';

// eslint-disable-next-line no-underscore-dangle
const _preloadImage = (url) =>
  new Promise((resolve) => {
    const image = new Image();

    image.onload = resolve;
    image.onerror = resolve;

    image.src = url;
  });

export function* fetchCards(listId) {
  const { boardId, lastCard } = yield select(selectors.selectListById, listId);
  const { search } = yield select(selectors.selectBoardById, boardId);
  const filterUserIds = yield select(selectors.selectFilterUserIdsForCurrentBoard);
  const filterLabelIds = yield select(selectors.selectFilterLabelIdsForCurrentBoard);

  function* getCardsRequest() {
    const response = {};

    try {
      response.body = yield call(request, api.getCards, listId, {
        search: (search && search.trim()) || undefined,
        userIds: filterUserIds.length > 0 ? filterUserIds.join(',') : undefined,
        labelIds: filterLabelIds.length > 0 ? filterLabelIds.join(',') : undefined,
        before: lastCard || undefined,
      });
    } catch (error) {
      response.error = error;
    }

    return response;
  }

  yield put(actions.fetchCards(listId));

  const getCardsRequestTask = yield fork(getCardsRequest);

  const [response] = yield race([
    join(getCardsRequestTask),
    take((action) => action.type === ActionTypes.CARDS_FETCH && action.payload.listId === listId),
  ]);

  if (!response) {
    return;
  }

  if (response.error) {
    yield put(actions.fetchCards.failure(listId, response.error));
    return;
  }

  const {
    body: {
      items: cards,
      included: {
        users,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        attachments,
        customFieldGroups,
        customFields,
        customFieldValues,
      },
    },
  } = response;

  yield put(
    actions.fetchCards.success(
      listId,
      cards,
      users,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    ),
  );
}

export function* fetchCardsInCurrentList() {
  const currentListId = yield select(selectors.selectCurrentListId);

  yield call(fetchCards, currentListId);
}

export function* handleCardsUpdate(cards, activities) {
  yield put(actions.handleCardsUpdate(cards, activities));
}

export function* createCard(listId, data, index, autoOpen) {
  const localId = yield call(createLocalId);
  const list = yield select(selectors.selectListById, listId);

  const currentUserMembership = yield select(
    selectors.selectCurrentUserMembershipByBoardId,
    list.boardId,
  );

  const nextData = {
    ...data,
  };

  if (isListFinite(list)) {
    nextData.position = yield select(selectors.selectNextCardPosition, listId, index);
  }

  yield put(
    actions.createCard(
      {
        ...nextData,
        listId,
        id: localId,
        boardId: list.boardId,
        creatorUserId: currentUserMembership.userId,
        isClosed: LIST_TYPE_STATE_BY_TYPE[list.type] === ListTypeStates.CLOSED,
      },
      autoOpen,
    ),
  );

  // TODO: use race instead
  let watchForCreateCardActionTask;
  if (autoOpen) {
    watchForCreateCardActionTask = yield fork(function* watchForCreateCardAction() {
      yield take((action) => action.type === ActionTypes.CARD_CREATE && action.payload.autoOpen);
    });
  }

  let card;
  try {
    ({ item: card } = yield call(request, api.createCard, listId, nextData));
  } catch (error) {
    yield put(actions.createCard.failure(localId, error));
    return;
  }

  yield put(actions.createCard.success(localId, card));

  if (watchForCreateCardActionTask && watchForCreateCardActionTask.isRunning()) {
    yield call(goToCard, card.id);
  }
}

export function* createCardInCurrentContext(data, index, autoOpen) {
  const firstKanbanListId = yield select(selectors.selectFirstKanbanListId);

  yield call(createCard, firstKanbanListId, data, index, autoOpen);
}

export function* createCardInCurrentList(data, autoOpen) {
  const currentListId = yield select(selectors.selectCurrentListId);

  yield call(createCard, currentListId, data, undefined, autoOpen);
}

export function* handleCardCreate(card) {
  let users;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields;
  let customFieldValues;

  try {
    ({
      item: card, // eslint-disable-line no-param-reassign
      included: {
        users,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        attachments,
        customFieldGroups,
        customFields,
        customFieldValues,
      },
    } = yield call(request, api.getCard, card.id));
  } catch {
    return;
  }

  yield put(
    actions.handleCardCreate(
      card,
      users,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    ),
  );
}

export function* updateCard(id, data) {
  let prevListId;
  let isClosed;

  if (data.listId) {
    const list = yield select(selectors.selectListById, data.listId);

    const card = yield select(selectors.selectCardById, id);
    const prevList = yield select(selectors.selectListById, card.listId);

    if (prevList.type === ListTypes.TRASH) {
      prevListId = null;
    } else if (isListArchiveOrTrash(list)) {
      prevListId = prevList.id;
    } else if (prevList.type === ListTypes.ARCHIVE) {
      prevListId = null;
    }

    const typeState = LIST_TYPE_STATE_BY_TYPE[list.type];

    if (card.isClosed) {
      if (typeState === ListTypeStates.OPENED) {
        isClosed = false;
      }
    } else if (typeState === ListTypeStates.CLOSED) {
      isClosed = true;
    }
  }

  yield put(
    actions.updateCard(id, {
      ...data,
      ...(prevListId !== undefined && {
        prevListId,
      }),
      ...(isClosed !== undefined && {
        isClosed,
      }),
    }),
  );

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
  const { cardId, boardId } = yield select(selectors.selectPath);

  let fetch = false;
  if (card.boardId) {
    const isAvailableForCurrentUser = yield select(
      selectors.selectIsCardWithIdAvailableForCurrentUser,
      card.id,
    );

    fetch = !isAvailableForCurrentUser;
  }

  let users;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields;
  let customFieldValues;

  if (fetch) {
    try {
      ({
        item: card, // eslint-disable-line no-param-reassign
        included: {
          users,
          cardMemberships,
          cardLabels,
          taskLists,
          tasks,
          attachments,
          customFieldGroups,
          customFields,
          customFieldValues,
        },
      } = yield call(request, api.getCard, card.id));
    } catch {
      fetch = false;
    }
  }

  yield put(
    actions.handleCardUpdate(
      card,
      fetch,
      users,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    ),
  );

  if (card.boardId === null && card.id === cardId) {
    yield call(goToBoard, boardId);
  }
}

export function* moveCard(id, listId, index) {
  const data = {};
  if (listId) {
    data.listId = listId;
  } else {
    // eslint-disable-next-line no-param-reassign
    ({ listId } = yield select(selectors.selectCardById, id));
  }

  const list = yield select(selectors.selectListById, listId);

  if (isListFinite(list)) {
    data.position = yield select(selectors.selectNextCardPosition, listId, index, id);
  }

  yield call(updateCard, id, data);
}

export function* moveCurrentCard(listId, index, autoClose) {
  const { cardId, boardId } = yield select(selectors.selectPath);

  if (autoClose) {
    yield call(goToBoard, boardId);
  }

  yield call(moveCard, cardId, listId, index);
}

export function* moveCardToArchive(id) {
  const archiveListId = yield select(selectors.selectArchiveListIdForCurrentBoard);

  yield call(moveCard, id, archiveListId);
}

export function* moveCurrentCardToArchive() {
  const archiveListId = yield select(selectors.selectArchiveListIdForCurrentBoard);

  yield call(moveCurrentCard, archiveListId, undefined, true);
}

export function* moveCardToTrash(id) {
  const trashListId = yield select(selectors.selectTrashListIdForCurrentBoard);

  yield call(moveCard, id, trashListId);
}

export function* moveCurrentCardToTrash() {
  const trashListId = yield select(selectors.selectTrashListIdForCurrentBoard);

  yield call(moveCurrentCard, trashListId, undefined, true);
}

export function* transferCard(id, boardId, listId, index) {
  const { cardId: currentCardId, boardId: currentBoardId } = yield select(selectors.selectPath);

  // TODO: hack?
  if (id === currentCardId) {
    yield call(goToBoard, currentBoardId);
  }

  const list = yield select(selectors.selectListById, listId);

  const data = {
    listId,
    boardId,
  };

  if (isListFinite(list)) {
    data.position = yield select(selectors.selectNextCardPosition, listId, index, id);
  }

  const typeState = LIST_TYPE_STATE_BY_TYPE[list.type];

  yield put(
    actions.transferCard(id, {
      ...data,
      isClosed: typeState === ListTypeStates.CLOSED,
    }),
  );

  let card;
  let updateError;

  try {
    ({ item: card } = yield call(request, api.updateCard, id, data));
  } catch (error) {
    updateError = error;
  }

  let users;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields;
  let customFieldValues;

  try {
    ({
      item: card,
      included: {
        users,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        attachments,
        customFieldGroups,
        customFields,
        customFieldValues,
      },
    } = yield call(request, api.getCard, id));
  } catch (error) {
    yield put(actions.transferCard.failure(id, error));
  }

  if (updateError) {
    yield put(
      actions.transferCard.failure(
        id,
        updateError,
        card,
        users,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        attachments,
        customFieldGroups,
        customFields,
        customFieldValues,
      ),
    );

    yield call(toast, {
      type: ToastTypes.SOURCE_CARD_NOT_MOVABLE,
    });

    return;
  }

  yield put(
    actions.transferCard.success(
      card,
      users,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    ),
  );
}

export function* transferCurrentCard(boardId, listId, index) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(transferCard, cardId, boardId, listId, index);
}

export function* duplicateCard(id, data) {
  const localId = yield call(createLocalId);
  const { cardId: currentCardId } = yield select(selectors.selectPath);
  const sourceCard = yield select(selectors.selectCardById, id);

  const boardId = data.boardId || sourceCard.boardId;
  const listId = data.listId || sourceCard.listId;

  const list = yield select(selectors.selectListById, listId);
  const typeState = LIST_TYPE_STATE_BY_TYPE[list.type];

  const nextData = {
    ...data,
  };

  if (!nextData.position && isListFinite(list)) {
    const index = yield select(selectors.selectCardIndexById, id);
    nextData.position = yield select(selectors.selectNextCardPosition, listId, index + 1);
  }

  const currentUserMembership = yield select(
    selectors.selectCurrentUserMembershipByBoardId,
    boardId,
  );

  yield put(
    actions.duplicateCard(id, localId, {
      ...nextData,
      creatorUserId: currentUserMembership.userId,
      isClosed: typeState === ListTypeStates.CLOSED,
      ...(sourceCard && {
        name: `${sourceCard.name} (${i18n.t('common.copy', {
          context: 'inline',
        })})`,
      }),
    }),
  );

  if (id === currentCardId) {
    yield call(goToBoard, boardId);
  }

  let card;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields;
  let customFieldValues;

  try {
    ({
      item: card,
      included: {
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        attachments,
        customFieldGroups,
        customFields,
        customFieldValues,
      },
    } = yield call(request, api.duplicateCard, id, nextData));
  } catch (error) {
    yield put(actions.duplicateCard.failure(localId, error));

    yield call(toast, {
      type: ToastTypes.SOURCE_CARD_NOT_COPYABLE,
    });

    return;
  }

  if (card.coverAttachmentId) {
    const coverAttachment = attachments.find(
      (attachment) => attachment.id === card.coverAttachmentId,
    );

    if (coverAttachment) {
      yield call(_preloadImage, coverAttachment.data.thumbnailUrls.outside360);
    }
  }

  yield put(
    actions.duplicateCard.success(
      localId,
      card,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    ),
  );
}

export function* duplicateCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(duplicateCard, cardId, data);
}

export function* copyCard(id) {
  yield put(actions.copyCard(id));
}

export function* cutCard(id) {
  yield put(actions.cutCard(id));
}

export function* pasteCard(listId) {
  const list = yield select(selectors.selectListById, listId);
  const clipboard = yield select(selectors.selectClipboard);
  const sourceCard = yield select(selectors.selectCardById, clipboard.cardId);

  yield put(actions.pasteCard());

  if (clipboard.type === ClipboardTypes.COPY) {
    const data = {
      listId,
    };
    if (!sourceCard || list.boardId !== sourceCard.boardId) {
      data.boardId = list.boardId;
    }
    if (isListFinite(list)) {
      data.position = yield select(selectors.selectNextCardPosition, listId);
    }

    yield call(duplicateCard, clipboard.cardId, data);
  } else if (clipboard.type === ClipboardTypes.CUT) {
    if (sourceCard && listId === sourceCard.listId) {
      return;
    }

    yield call(transferCard, clipboard.cardId, list.boardId, list.id);
  }
}

export function* pasteCardInCurrentContext() {
  const listId = yield select(selectors.selectFirstKanbanListId);

  yield call(pasteCard, listId);
}

export function* pasteCardInCurrentList() {
  const currentListId = yield select(selectors.selectCurrentListId);

  yield call(pasteCard, currentListId);
}

export function* goToAdjacentCard(direction) {
  const card = yield select(selectors.selectCurrentCard);
  const list = yield select(selectors.selectListById, card.listId);

  let cardIds;
  if (isListFinite(list)) {
    const { view } = yield select(selectors.selectCurrentBoard);

    if (view === BoardViews.KANBAN) {
      cardIds = yield select(selectors.selectFilteredCardIdsByListId, card.listId);
    } else {
      cardIds = yield select(selectors.selectFilteredCardIdsForCurrentBoard);
    }
  } else {
    cardIds = yield select(selectors.selectFilteredCardIdsByListId, card.listId);

    if (direction === 1 && card.id === cardIds[cardIds.length - 1]) {
      if (list.isCardsFetching || list.isAllCardsFetched) {
        return;
      }

      const [, cancelled] = yield race([call(fetchCards, list.id), take(LOCATION_CHANGE_HANDLE)]);

      if (cancelled) {
        return;
      }

      cardIds = yield select(selectors.selectFilteredCardIdsByListId, card.listId);
    }
  }

  const index = cardIds.indexOf(card.id);

  if (index === -1) {
    return;
  }

  const adjacentCardId = cardIds[index + direction];

  if (adjacentCardId) {
    yield call(goToCard, adjacentCardId);
  }
}

export function* deleteCard(id) {
  const { cardId, boardId } = yield select(selectors.selectPath);

  yield put(actions.deleteCard(id));

  if (id === cardId) {
    yield call(goToBoard, boardId);
  }

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
  const { cardId } = yield select(selectors.selectPath);

  yield put(actions.handleCardDelete(card));

  if (card.id === cardId) {
    yield call(goToBoard, card.boardId);
  }
}

export default {
  fetchCards,
  fetchCardsInCurrentList,
  handleCardsUpdate,
  createCard,
  createCardInCurrentContext,
  createCardInCurrentList,
  handleCardCreate,
  updateCard,
  updateCurrentCard,
  handleCardUpdate,
  moveCard,
  moveCurrentCard,
  moveCardToArchive,
  moveCurrentCardToArchive,
  moveCardToTrash,
  moveCurrentCardToTrash,
  transferCard,
  transferCurrentCard,
  duplicateCard,
  duplicateCurrentCard,
  copyCard,
  cutCard,
  pasteCard,
  pasteCardInCurrentContext,
  pasteCardInCurrentList,
  goToAdjacentCard,
  deleteCard,
  deleteCurrentCard,
  handleCardDelete,
};
