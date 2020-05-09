import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createCard = (card) => ({
  type: ActionTypes.CARD_CREATE,
  payload: {
    card,
  },
});

export const updateCard = (id, data) => ({
  type: ActionTypes.CARD_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteCard = (id) => ({
  type: ActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createCardRequested = (localId, data) => ({
  type: ActionTypes.CARD_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createCardSucceeded = (
  localId,
  card,
  cardMemberships,
  cardLabels,
  tasks,
  attachments,
) => ({
  type: ActionTypes.CARD_CREATE_SUCCEEDED,
  payload: {
    localId,
    card,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
  },
});

export const createCardFailed = (localId, error) => ({
  type: ActionTypes.CARD_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const createCardReceived = (card, cardMemberships, cardLabels, tasks, attachments) => ({
  type: ActionTypes.CARD_CREATE_RECEIVED,
  payload: {
    card,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
  },
});

export const fetchCardRequested = (id) => ({
  type: ActionTypes.CARD_FETCH_REQUESTED,
  payload: {
    id,
  },
});

export const fetchCardSucceeded = (card) => ({
  type: ActionTypes.CARD_FETCH_SUCCEEDED,
  payload: {
    card,
  },
});

export const fetchCardFailed = (id, error) => ({
  type: ActionTypes.CARD_FETCH_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateCardRequested = (id, data) => ({
  type: ActionTypes.CARD_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateCardSucceeded = (card) => ({
  type: ActionTypes.CARD_UPDATE_SUCCEEDED,
  payload: {
    card,
  },
});

export const updateCardFailed = (id, error) => ({
  type: ActionTypes.CARD_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateCardReceived = (card) => ({
  type: ActionTypes.CARD_UPDATE_RECEIVED,
  payload: {
    card,
  },
});

export const deleteCardRequested = (id) => ({
  type: ActionTypes.CARD_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteCardSucceeded = (card) => ({
  type: ActionTypes.CARD_DELETE_SUCCEEDED,
  payload: {
    card,
  },
});

export const deleteCardFailed = (id, error) => ({
  type: ActionTypes.CARD_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteCardReceived = (card) => ({
  type: ActionTypes.CARD_DELETE_RECEIVED,
  payload: {
    card,
  },
});
