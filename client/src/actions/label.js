import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createLabel = (label) => ({
  type: ActionTypes.LABEL_CREATE,
  payload: {
    label,
  },
});

export const updateLabel = (id, data) => ({
  type: ActionTypes.LABEL_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteLabel = (id) => ({
  type: ActionTypes.LABEL_DELETE,
  payload: {
    id,
  },
});

export const addLabelToCard = (id, cardId) => ({
  type: ActionTypes.LABEL_TO_CARD_ADD,
  payload: {
    id,
    cardId,
  },
});

export const removeLabelFromCard = (id, cardId) => ({
  type: ActionTypes.LABEL_FROM_CARD_REMOVE,
  payload: {
    id,
    cardId,
  },
});

export const addLabelToBoardFilter = (id, boardId) => ({
  type: ActionTypes.LABEL_TO_BOARD_FILTER_ADD,
  payload: {
    id,
    boardId,
  },
});

export const removeLabelFromBoardFilter = (id, boardId) => ({
  type: ActionTypes.LABEL_FROM_BOARD_FILTER_REMOVE,
  payload: {
    id,
    boardId,
  },
});

/* Events */

export const createLabelRequested = (localId, data) => ({
  type: ActionTypes.LABEL_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createLabelSucceeded = (localId, label) => ({
  type: ActionTypes.LABEL_CREATE_SUCCEEDED,
  payload: {
    localId,
    label,
  },
});

export const createLabelFailed = (localId, error) => ({
  type: ActionTypes.LABEL_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const createLabelReceived = (label) => ({
  type: ActionTypes.LABEL_CREATE_RECEIVED,
  payload: {
    label,
  },
});

export const updateLabelRequested = (id, data) => ({
  type: ActionTypes.LABEL_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateLabelSucceeded = (label) => ({
  type: ActionTypes.LABEL_UPDATE_SUCCEEDED,
  payload: {
    label,
  },
});

export const updateLabelFailed = (id, error) => ({
  type: ActionTypes.LABEL_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateLabelReceived = (label) => ({
  type: ActionTypes.LABEL_UPDATE_RECEIVED,
  payload: {
    label,
  },
});

export const deleteLabelRequested = (id) => ({
  type: ActionTypes.LABEL_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteLabelSucceeded = (label) => ({
  type: ActionTypes.LABEL_DELETE_SUCCEEDED,
  payload: {
    label,
  },
});

export const deleteLabelFailed = (id, error) => ({
  type: ActionTypes.LABEL_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteLabelReceived = (label) => ({
  type: ActionTypes.LABEL_DELETE_RECEIVED,
  payload: {
    label,
  },
});
