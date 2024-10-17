import ActionTypes from '../constants/ActionTypes';

const createCard = (card) => ({
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

const handleCardCreate = (card, cardMemberships, cardLabels, tasks, attachments) => ({
  type: ActionTypes.CARD_CREATE_HANDLE,
  payload: {
    card,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
  },
});

const updateCard = (id, data) => ({
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

const handleCardUpdate = (card, isFetched, cardMemberships, cardLabels, tasks, attachments) => ({
  type: ActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
    isFetched,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
  },
});

const duplicateCard = (id, card, taskIds) => ({
  type: ActionTypes.CARD_DUPLICATE,
  payload: {
    id,
    card,
    taskIds,
  },
});

duplicateCard.success = (localId, card, cardMemberships, cardLabels, tasks) => ({
  type: ActionTypes.CARD_DUPLICATE__SUCCESS,
  payload: {
    localId,
    card,
    cardMemberships,
    cardLabels,
    tasks,
  },
});

duplicateCard.failure = (id, error) => ({
  type: ActionTypes.CARD_DUPLICATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteCard = (id) => ({
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

const handleCardDelete = (card) => ({
  type: ActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});

const filterText = (boardId, text) => ({
  type: ActionTypes.TEXT_FILTER_IN_CURRENT_BOARD,
  payload: {
    boardId,
    text,
  },
});

export default {
  createCard,
  handleCardCreate,
  updateCard,
  handleCardUpdate,
  duplicateCard,
  deleteCard,
  handleCardDelete,
  filterText,
};
