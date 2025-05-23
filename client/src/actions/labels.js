/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createLabel = (label) => ({
  type: ActionTypes.LABEL_CREATE,
  payload: {
    label,
  },
});

createLabel.success = (localId, label) => ({
  type: ActionTypes.LABEL_CREATE__SUCCESS,
  payload: {
    localId,
    label,
  },
});

createLabel.failure = (localId, error) => ({
  type: ActionTypes.LABEL_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const createLabelFromCard = (cardId, label) => ({
  type: ActionTypes.LABEL_FROM_CARD_CREATE,
  payload: {
    cardId,
    label,
  },
});

createLabelFromCard.success = (localId, label, cardLabel) => ({
  type: ActionTypes.LABEL_FROM_CARD_CREATE__SUCCESS,
  payload: {
    localId,
    label,
    cardLabel,
  },
});

createLabelFromCard.failure = (cardId, localId, error) => ({
  type: ActionTypes.LABEL_FROM_CARD_CREATE__FAILURE,
  payload: {
    cardId,
    localId,
    error,
  },
});

const handleLabelCreate = (label) => ({
  type: ActionTypes.LABEL_CREATE_HANDLE,
  payload: {
    label,
  },
});

const updateLabel = (id, data) => ({
  type: ActionTypes.LABEL_UPDATE,
  payload: {
    id,
    data,
  },
});

updateLabel.success = (label) => ({
  type: ActionTypes.LABEL_UPDATE__SUCCESS,
  payload: {
    label,
  },
});

updateLabel.failure = (id, error) => ({
  type: ActionTypes.LABEL_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleLabelUpdate = (label) => ({
  type: ActionTypes.LABEL_UPDATE_HANDLE,
  payload: {
    label,
  },
});

const deleteLabel = (id) => ({
  type: ActionTypes.LABEL_DELETE,
  payload: {
    id,
  },
});

deleteLabel.success = (label) => ({
  type: ActionTypes.LABEL_DELETE__SUCCESS,
  payload: {
    label,
  },
});

deleteLabel.failure = (id, error) => ({
  type: ActionTypes.LABEL_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleLabelDelete = (label) => ({
  type: ActionTypes.LABEL_DELETE_HANDLE,
  payload: {
    label,
  },
});

const addLabelToCard = (id, cardId) => ({
  type: ActionTypes.LABEL_TO_CARD_ADD,
  payload: {
    id,
    cardId,
  },
});

addLabelToCard.success = (cardLabel) => ({
  type: ActionTypes.LABEL_TO_CARD_ADD__SUCCESS,
  payload: {
    cardLabel,
  },
});

addLabelToCard.failure = (id, cardId, error) => ({
  type: ActionTypes.LABEL_TO_CARD_ADD__FAILURE,
  payload: {
    id,
    cardId,
    error,
  },
});

const handleLabelToCardAdd = (cardLabel) => ({
  type: ActionTypes.LABEL_TO_CARD_ADD_HANDLE,
  payload: {
    cardLabel,
  },
});

const removeLabelFromCard = (id, cardId) => ({
  type: ActionTypes.LABEL_FROM_CARD_REMOVE,
  payload: {
    id,
    cardId,
  },
});

removeLabelFromCard.success = (cardLabel) => ({
  type: ActionTypes.LABEL_FROM_CARD_REMOVE__SUCCESS,
  payload: {
    cardLabel,
  },
});

removeLabelFromCard.failure = (id, cardId, error) => ({
  type: ActionTypes.LABEL_FROM_CARD_REMOVE__FAILURE,
  payload: {
    id,
    cardId,
    error,
  },
});

const handleLabelFromCardRemove = (cardLabel) => ({
  type: ActionTypes.LABEL_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardLabel,
  },
});

const addLabelToBoardFilter = (id, boardId, currentListId) => ({
  type: ActionTypes.LABEL_TO_BOARD_FILTER_ADD,
  payload: {
    id,
    boardId,
    currentListId,
  },
});

const removeLabelFromBoardFilter = (id, boardId, currentListId) => ({
  type: ActionTypes.LABEL_FROM_BOARD_FILTER_REMOVE,
  payload: {
    id,
    boardId,
    currentListId,
  },
});

export default {
  createLabel,
  createLabelFromCard,
  handleLabelCreate,
  updateLabel,
  handleLabelUpdate,
  deleteLabel,
  handleLabelDelete,
  addLabelToCard,
  handleLabelToCardAdd,
  removeLabelFromCard,
  handleLabelFromCardRemove,
  addLabelToBoardFilter,
  removeLabelFromBoardFilter,
};
