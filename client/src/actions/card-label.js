import ActionTypes from '../constants/ActionTypes';

/* Events */

export const createCardLabelRequested = (data) => ({
  type: ActionTypes.CARD_LABEL_CREATE_REQUESTED,
  payload: {
    data,
  },
});

export const createCardLabelSucceeded = (cardLabel) => ({
  type: ActionTypes.CARD_LABEL_CREATE_SUCCEEDED,
  payload: {
    cardLabel,
  },
});

export const createCardLabelFailed = (error) => ({
  type: ActionTypes.CARD_LABEL_CREATE_FAILED,
  payload: {
    error,
  },
});

export const createCardLabelReceived = (cardLabel) => ({
  type: ActionTypes.CARD_LABEL_CREATE_RECEIVED,
  payload: {
    cardLabel,
  },
});

export const deleteCardLabelRequested = (cardId, labelId) => ({
  type: ActionTypes.CARD_LABEL_DELETE_REQUESTED,
  payload: {
    cardId,
    labelId,
  },
});

export const deleteCardLabelSucceeded = (cardLabel) => ({
  type: ActionTypes.CARD_LABEL_DELETE_SUCCEEDED,
  payload: {
    cardLabel,
  },
});

export const deleteCardLabelFailed = (cardId, labelId, error) => ({
  type: ActionTypes.CARD_LABEL_DELETE_FAILED,
  payload: {
    cardId,
    labelId,
    error,
  },
});

export const deleteCardLabelReceived = (cardLabel) => ({
  type: ActionTypes.CARD_LABEL_DELETE_RECEIVED,
  payload: {
    cardLabel,
  },
});
