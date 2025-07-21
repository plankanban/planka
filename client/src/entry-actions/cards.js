/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const fetchCardsInCurrentList = () => ({
  type: EntryActionTypes.CARDS_IN_CURRENT_LIST_FETCH,
  payload: {},
});

const handleCardsUpdate = (cards, activities) => ({
  type: EntryActionTypes.CARDS_UPDATE_HANDLE,
  payload: {
    cards,
    activities,
  },
});

const createCard = (listId, data, index, autoOpen = false) => ({
  type: EntryActionTypes.CARD_CREATE,
  payload: {
    listId,
    data,
    index,
    autoOpen,
  },
});

const createCardInFirstFiniteList = (data, index = 0, autoOpen = false) => ({
  type: EntryActionTypes.CARD_IN_FIRST_FINITE_LIST_CREATE,
  payload: {
    data,
    index,
    autoOpen,
  },
});

const createCardInCurrentList = (data, autoOpen = false) => ({
  type: EntryActionTypes.CARD_IN_CURRENT_LIST_CREATE,
  payload: {
    data,
    autoOpen,
  },
});

const handleCardCreate = (card) => ({
  type: EntryActionTypes.CARD_CREATE_HANDLE,
  payload: {
    card,
  },
});

const updateCard = (id, data) => ({
  type: EntryActionTypes.CARD_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentCard = (data) => ({
  type: EntryActionTypes.CURRENT_CARD_UPDATE,
  payload: {
    data,
  },
});

const handleCardUpdate = (card) => ({
  type: EntryActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
  },
});

const moveCard = (id, listId, index = 0) => ({
  type: EntryActionTypes.CARD_MOVE,
  payload: {
    id,
    listId,
    index,
  },
});

const moveCurrentCard = (listId, index = 0, autoClose = false) => ({
  type: EntryActionTypes.CURRENT_CARD_MOVE,
  payload: {
    listId,
    index,
    autoClose,
  },
});

const moveCardToArchive = (id) => ({
  type: EntryActionTypes.CARD_TO_ARCHIVE_MOVE,
  payload: {
    id,
  },
});

const moveCurrentCardToArchive = () => ({
  type: EntryActionTypes.CURRENT_CARD_TO_ARCHIVE_MOVE,
  payload: {},
});

const moveCardToTrash = (id) => ({
  type: EntryActionTypes.CARD_TO_TRASH_MOVE,
  payload: {
    id,
  },
});

const moveCurrentCardToTrash = () => ({
  type: EntryActionTypes.CURRENT_CARD_TO_TRASH_MOVE,
  payload: {},
});

const transferCard = (id, boardId, listId, index = 0) => ({
  type: EntryActionTypes.CARD_TRANSFER,
  payload: {
    id,
    boardId,
    listId,
    index,
  },
});

const transferCurrentCard = (boardId, listId, index = 0) => ({
  type: EntryActionTypes.CURRENT_CARD_TRANSFER,
  payload: {
    boardId,
    listId,
    index,
  },
});

const duplicateCard = (id, data) => ({
  type: EntryActionTypes.CARD_DUPLICATE,
  payload: {
    id,
    data,
  },
});

const duplicateCurrentCard = (data) => ({
  type: EntryActionTypes.CURRENT_CARD_DUPLICATE,
  payload: {
    data,
  },
});

const goToAdjacentCard = (direction) => ({
  type: EntryActionTypes.TO_ADJACENT_CARD_GO,
  payload: {
    direction,
  },
});

const deleteCard = (id) => ({
  type: EntryActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

const deleteCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_CARD_DELETE,
  payload: {},
});

const handleCardDelete = (card) => ({
  type: EntryActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});

export default {
  fetchCardsInCurrentList,
  handleCardsUpdate,
  createCard,
  createCardInFirstFiniteList,
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
  goToAdjacentCard,
  deleteCard,
  deleteCurrentCard,
  handleCardDelete,
};
