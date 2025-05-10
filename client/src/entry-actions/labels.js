/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createLabelInCurrentBoard = (data) => ({
  type: EntryActionTypes.LABEL_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const createLabelFromCard = (cardId, data) => ({
  type: EntryActionTypes.LABEL_FROM_CARD_CREATE,
  payload: {
    cardId,
    data,
  },
});

const handleLabelCreate = (label) => ({
  type: EntryActionTypes.LABEL_CREATE_HANDLE,
  payload: {
    label,
  },
});

const updateLabel = (id, data) => ({
  type: EntryActionTypes.LABEL_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleLabelUpdate = (label) => ({
  type: EntryActionTypes.LABEL_UPDATE_HANDLE,
  payload: {
    label,
  },
});

const moveLabel = (id, index) => ({
  type: EntryActionTypes.LABEL_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteLabel = (id) => ({
  type: EntryActionTypes.LABEL_DELETE,
  payload: {
    id,
  },
});

const handleLabelDelete = (label) => ({
  type: EntryActionTypes.LABEL_DELETE_HANDLE,
  payload: {
    label,
  },
});

const addLabelToCard = (id, cardId) => ({
  type: EntryActionTypes.LABEL_TO_CARD_ADD,
  payload: {
    id,
    cardId,
  },
});

const addLabelToCurrentCard = (id) => ({
  type: EntryActionTypes.LABEL_TO_CURRENT_CARD_ADD,
  payload: {
    id,
  },
});

const handleLabelToCardAdd = (cardLabel) => ({
  type: EntryActionTypes.LABEL_TO_CARD_ADD_HANDLE,
  payload: {
    cardLabel,
  },
});

const removeLabelFromCard = (id, cardId) => ({
  type: EntryActionTypes.LABEL_FROM_CARD_REMOVE,
  payload: {
    id,
    cardId,
  },
});

const removeLabelFromCurrentCard = (id) => ({
  type: EntryActionTypes.LABEL_FROM_CURRENT_CARD_REMOVE,
  payload: {
    id,
  },
});

const handleLabelFromCardRemove = (cardLabel) => ({
  type: EntryActionTypes.LABEL_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardLabel,
  },
});

const addLabelToFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.LABEL_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
  },
});

const removeLabelFromFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.LABEL_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
  payload: {
    id,
  },
});

export default {
  createLabelInCurrentBoard,
  createLabelFromCard,
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
  addLabelToFilterInCurrentBoard,
  removeLabelFromFilterInCurrentBoard,
};
