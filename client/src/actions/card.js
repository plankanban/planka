import ActionTypes from '../constants/ActionTypes';

export const createCard = (card) => ({
  type: ActionTypes.CARD_CREATE,
  payload: {
    card,
  },
});

createCard.success = (localId, card) => ({
  type: ActionTypes.CARD_CREATE__SUCCESS,
  payload: {
    localId,
    card,
  },
});

createCard.failure = (localId, error) => ({
  type: ActionTypes.CARD_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

export const handleCardCreate = (card) => ({
  type: ActionTypes.CARD_CREATE_HANDLE,
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

updateCard.success = (card) => ({
  type: ActionTypes.CARD_UPDATE__SUCCESS,
  payload: {
    card,
  },
});

updateCard.failure = (id, error) => ({
  type: ActionTypes.CARD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleCardUpdate = (card) => ({
  type: ActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
  },
});

export const deleteCard = (id) => ({
  type: ActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

deleteCard.success = (card) => ({
  type: ActionTypes.CARD_DELETE__SUCCESS,
  payload: {
    card,
  },
});

deleteCard.failure = (id, error) => ({
  type: ActionTypes.CARD_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleCardDelete = (card) => ({
  type: ActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});
